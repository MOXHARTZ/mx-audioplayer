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
import i18next from 'i18next'
import classNames from 'classnames'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, ScrollShadow, Tooltip, Input } from "@heroui/react";
import TrackCard from './TrackCard'
import SearchSkeleton from './Skeleton'

const SearchTrack = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
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
            url: track.videoId,
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
            url: track.videoId,
            duration: 0,
        }
        dispatch(setCurrentSongs([...currentSongs, soundData]))
    }), [setCurrentSongs, currentSongs])

    const processUrl = useCallback(async (url: string) => {
        dispatch(setWaitingForResponse(true))
        const response = await fetchNui<{ title: string; artist: string; thumbnail: string; videoId?: string }>('getSoundData', { url: url })
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
        <Modal backdrop='opaque' isOpen={open} onClose={handleClose} size='xl'>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{i18next.t('search_track.title')}</ModalHeader>
                        <ModalBody>
                            <p>{i18next.t('search_track.content')}</p>
                            <div className='flex items-center justify-between'>
                                <Tooltip size='sm' showArrow={true} color='danger' content={i18next.t('search_track.knowledge')}>
                                    <Input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && fetchTrackList()}
                                        disabled={waitingForResponse}
                                        classNames={{
                                            label: "text-black/50 dark:text-white/90",
                                            input: [
                                                "bg-transparent",
                                                "text-black/90 dark:text-white/90",
                                                "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                            ],
                                            innerWrapper: "bg-transparent",
                                            inputWrapper: [
                                                "shadow-xl",
                                                "bg-default-200/50",
                                                "dark:bg-default/60",
                                                "backdrop-blur-xl",
                                                "backdrop-saturate-200",
                                                "hover:bg-default-200/70",
                                                "dark:hover:bg-default/70",
                                                "group-data-[focused=true]:bg-default-200/50",
                                                "dark:group-data-[focused=true]:bg-default/60",
                                                "!cursor-text",
                                            ],
                                        }}
                                        placeholder={i18next.t('search_track.placeholder')}
                                        startContent={
                                            <BiSearch className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                                        }
                                    />
                                </Tooltip>
                            </div>
                            <ScrollShadow className={classNames({
                                'flex flex-col gap-2 max-h-120 overflow-y-auto md:max-h-96 sm:max-h-64': true,
                            })}>
                                {(trackList.length > 0 || waitingForResponse) && <div ref={searchResultsAnimationParent} className='flex flex-col gap-4'>
                                    {waitingForResponse ? (
                                        <div>
                                            {new Array(25).fill(0).map((_, i) => (
                                                <SearchSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : (
                                        trackList.map(track => (
                                            <TrackCard
                                                key={track.id}
                                                track={track}
                                                onClick={() => handlePlay(track)}
                                            />
                                        ))
                                    )}
                                </div>}
                            </ScrollShadow>
                        </ModalBody>
                        {trackList.length > 0 && (
                            <ModalFooter>
                                <footer className='mt-3 flex justify-end gap-2'>
                                    <Button color='danger' variant="light" onPress={handleClose}>{i18next.t('general.cancel')}</Button>
                                    <Button color='primary' onPress={addAll}>{i18next.t('search_track.add_all')}</Button>
                                </footer>
                            </ModalFooter>
                        )}
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default SearchTrack