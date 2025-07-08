import { useCallback, useMemo, useState } from 'react'
import memoize from 'fast-memoize'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '@/stores'
import { tracks, Track } from '@/fake-api/search-results'
import { isEnvBrowser, isSpotifyAlbum, isSpotifyPlaylist, isUrl, getYoutubePlaylistID, YOUTUBE_URL } from '@/utils/misc'
import { setCurrentSongs, setWaitingForResponse } from '@/stores/Main'
import { fetchNui } from '@/utils/fetchNui'
import { toast } from 'react-toastify'
import { QueryResult } from '@/utils/types'
import { BiSearch } from 'react-icons/bi'
import { IoMusicalNotesOutline } from 'react-icons/io5'
import i18next from 'i18next'
import classNames from 'classnames'
import { Modal, ModalContent, Button, ScrollShadow, Tooltip, Input } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import TrackCard from './TrackCard'
import SearchSkeleton from './Skeleton'
import MX from "/mx.svg";

type SearchTrackProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const SearchTrack = ({ open, setOpen }: SearchTrackProps) => {
    const { waitingForResponse, currentSongs } = useAppSelector(state => state.Main)
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>(isEnvBrowser() ? tracks : [])
    const dispatch = useAppDispatch()
    const [searchResultsAnimationParent] = useAutoAnimate()

    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('')
    }, []);

    const addAll = useCallback(() => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'))
        if (trackList.length === 0) return;
        const _trackList = trackList.map(track => ({ ...track, id: nanoid() }))
        const _trackListData = _trackList.map(track => ({
            id: nanoid(),
            soundId: nanoid(),
            title: track.name ?? i18next.t('general.unknown'),
            artist: track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown'),
            cover: track.thumbnails[track.thumbnails.length - 1].url,
            url: track.url,
            duration: 0,
        }))
        dispatch(setCurrentSongs([...currentSongs, ..._trackListData]))
        handleClose()
    }, [trackList, currentSongs])

    const handlePlay = useMemo(() => memoize(async (track: Track) => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'));
        handleClose()
        const artist = track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown')
        const soundData = {
            id: nanoid(),
            soundId: nanoid(),
            title: track?.name ?? i18next.t('general.unknown'),
            artist,
            cover: track.thumbnails[track.thumbnails.length - 1].url,
            url: track.url,
            duration: 0,
        }
        dispatch(setCurrentSongs([...currentSongs, soundData]))
    }), [setCurrentSongs, currentSongs])

    const processUrl = useCallback(async (url: string) => {
        dispatch(setWaitingForResponse(true))
        const response = await fetchNui<{ title: string; artist: string; thumbnail: string; videoId?: string; url?: string }>('getSoundData', { url: url })
        if (!response) {
            dispatch(setWaitingForResponse(false))
            return toast.error(i18next.t('search_track.invalid_url'))
        }
        const _data = {
            id: nanoid(),
            artists: [{ name: response.artist, artistId: 'unknown' }],
            name: response.title,
            thumbnails: [{ url: response.thumbnail, width: 90, height: 90 }],
            videoId: response.videoId ?? url,
            url: response?.url ?? url
        }
        setTrackList([_data])
        dispatch(setWaitingForResponse(false))
    }, [])

    const fetchTrackList = useCallback(async () => {
        if (!query) return setTrackList([])
        const _query = query.replace(/\s/g, '%20').replace(/\/intl-[a-z]{2}\//, '/')
        const isTracks = getYoutubePlaylistID(_query) || isSpotifyPlaylist(_query) || isSpotifyAlbum(_query)
        const getInfo = isUrl(_query) && !isTracks
        if (getInfo) return processUrl(_query)
        dispatch(setWaitingForResponse(true))
        const endPoint = isTracks ? 'searchTracks' : 'searchQuery'
        let result = await fetchNui<QueryResult>(endPoint, { query: _query })
        dispatch(setWaitingForResponse(false))
        if (!result) return setTrackList([])
        if (typeof result === 'object' && 'error' in result) return toast.error(result.error)
        if (!result) return setTrackList([])
        result = result.map(track => ({ ...track, id: nanoid(), videoId: track.videoId && `${YOUTUBE_URL}${track.videoId}` }))
        setTrackList(result)
    }, [query])

    return (
        <Modal isOpen={open} size="2xl" onOpenChange={setOpen} classNames={{
            backdrop: "bg-black/80",
            base: "bg-transparent shadow-none",
            wrapper: "bg-transparent"
        }}>
            <ModalContent>
                {(onClose) => (
                    <div className="relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-rose-900/20"
                            animate={{
                                background: [
                                    "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                ]
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20
                            }}
                            className="flex w-full flex-col gap-6 rounded-2xl bg-black/40 border border-rose-500/20 p-8 shadow-2xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                className="flex flex-col items-center gap-4"
                            >
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-white-500 to-rose-500 p-2 flex items-center justify-center shadow-lg shadow-rose-500/25"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 25px rgba(244, 63, 94, 0.4)",
                                        transition: { type: "spring", stiffness: 300, damping: 20 }
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                        transition: { type: "spring", stiffness: 400, damping: 15 }
                                    }}
                                >
                                    <img src={MX} alt="MX" className="w-full h-full object-cover rounded-full mt-1" />
                                </motion.div>
                                <div className="text-center flex flex-col items-center justify-center">
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent flex items-center gap-2">
                                        <IoMusicalNotesOutline className="text-rose-400" />
                                        {i18next.t('search_track.title')}
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">{i18next.t('search_track.subtitle')}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    delay: 0.4
                                }}
                                className="space-y-6"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                    className="flex flex-col gap-4"
                                >
                                    <p className="text-gray-300 text-center">{i18next.t('search_track.content')}</p>

                                    <div className='flex items-center justify-between'>
                                        <Tooltip size='sm' showArrow={true} color='danger' content={i18next.t('search_track.knowledge')}>
                                            <Input
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && fetchTrackList()}
                                                disabled={waitingForResponse}
                                                classNames={{
                                                    label: "text-white/90",
                                                    input: [
                                                        "bg-transparent",
                                                        "text-white/90",
                                                        "placeholder:text-white/60",
                                                        "transition-all duration-300",
                                                    ],
                                                    innerWrapper: "bg-transparent",
                                                    inputWrapper: [
                                                        "shadow-xl",
                                                        "bg-black/30",
                                                        "border-2 border-rose-500/30",
                                                        "",
                                                        "",
                                                        "hover:bg-black/40",
                                                        "hover:border-rose-400/50",
                                                        "hover:shadow-rose-500/20",
                                                        "group-data-[focused=true]:bg-black/40",
                                                        "group-data-[focused=true]:border-rose-400/50",
                                                        "group-data-[focused=true]:shadow-rose-500/30",
                                                        "group-data-[focused=true]:scale-[1.02]",
                                                        "!cursor-text",
                                                        "rounded-xl",
                                                        "transition-all duration-300 ease-out",
                                                    ],
                                                }}
                                                placeholder={i18next.t('search_track.placeholder')}
                                                startContent={
                                                    <BiSearch className="text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                                                }
                                            />
                                        </Tooltip>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 20,
                                        delay: 0.6
                                    }}
                                    className="max-h-96 overflow-y-auto"
                                >
                                    <ScrollShadow className="flex flex-col gap-2">
                                        <AnimatePresence mode="wait">
                                            {(trackList.length > 0 || waitingForResponse) && (
                                                <motion.div
                                                    ref={searchResultsAnimationParent}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 150,
                                                        damping: 20
                                                    }}
                                                    className='flex flex-col gap-4'
                                                >
                                                    {waitingForResponse ? (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            {new Array(5).fill(0).map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{
                                                                        delay: i * 0.1,
                                                                        duration: 0.3
                                                                    }}
                                                                >
                                                                    <SearchSkeleton />
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    ) : (
                                                        trackList.map((track, index) => (
                                                            <motion.div
                                                                key={track.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{
                                                                    delay: index * 0.05,
                                                                    duration: 0.3
                                                                }}
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.99 }}
                                                            >
                                                                <TrackCard
                                                                    track={track}
                                                                    onClick={() => handlePlay(track)}
                                                                />
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </ScrollShadow>
                                </motion.div>
                            </motion.div>

                            <AnimatePresence>
                                {trackList.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 20
                                        }}
                                        className="flex gap-3 pt-4"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                            className="flex-1"
                                        >
                                            <Button
                                                fullWidth
                                                color="default"
                                                variant="bordered"
                                                onPress={onClose}
                                                className="bg-black/20 border-rose-500/30 text-white hover:border-rose-400/50 hover:bg-black/30 transition-all duration-300"
                                            >
                                                {i18next.t('general.cancel')}
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                            className="flex-1"
                                        >
                                            <Button
                                                fullWidth
                                                className="bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
                                                onPress={addAll}
                                            >
                                                {i18next.t('search_track.add_all')}
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    )
}

export default SearchTrack