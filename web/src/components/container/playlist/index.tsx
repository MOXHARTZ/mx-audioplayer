import { useEffect, useCallback, useMemo, Fragment, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setCurrentPlaylistId, setCurrentSongs, setPlaying, setSelectedSongs } from '@/stores/Main'
import { Song } from '@/fake-api/song'
import { handlePlay } from '@/thunks/handlePlay'
import i18next from 'i18next'
import { useParams } from 'react-router-dom'
import { VirtuosoGrid } from 'react-virtuoso'
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from 'array-move'
import TrackCard from './TrackCard'
import { Spinner } from '@heroui/react'
import { motion } from 'framer-motion'
import { IoPlayOutline } from 'react-icons/io5'
import { notification } from '@/utils/misc'
import Empty from './Empty'
import React from 'react'
import { fetchNui } from '@/utils/fetchNui'

const Playlist = () => {
    const { currentSongs, position, editMode, selectedSongs, volume, filterPlaylist, playing } = useAppSelector(state => state.Main)
    const { playlistId } = useParams() as { playlistId: string }
    const dispatch = useAppDispatch()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [animationsComplete, setAnimationsComplete] = useState({
        container: false,
        header: false
    })

    const setCurrentSong = useCallback((id: string) => {
        if (id === position) {
            dispatch(setPlaying(!playing))
            return
        }

        dispatch(setPlaying(false))
        const soundData = currentSongs?.find(song => song.id === id)

        if (!soundData) {
            notification(i18next.t('playlist.song_not_exist'), 'error')
            return
        }

        dispatch(handlePlay({
            position: id,
            soundData,
            volume
        }))
    }, [currentSongs, position, volume, dispatch, playing])

    const toggleSelectedSong = useCallback((id: string) => {
        if (selectedSongs.includes(id)) {
            dispatch(setSelectedSongs(selectedSongs.filter(song => song !== id)))
        } else {
            dispatch(setSelectedSongs([...selectedSongs, id]))
        }
    }, [selectedSongs, dispatch])

    const handleSongClick = useCallback((song: Song) => {
        if (editMode) {
            toggleSelectedSong(song.id)
            return
        }
        setCurrentSong(song.id)
    }, [editMode, toggleSelectedSong, setCurrentSong])

    useEffect(() => {
        dispatch(setCurrentPlaylistId(playlistId))
        fetchNui('setCurrentPlaylistId', playlistId)
    }, [playlistId])

    const onSortEnd = useCallback((oldIndex: number, newIndex: number) => {
        if (!currentSongs) {
            notification(i18next.t('playlist.select_playlist'), 'error')
            return
        }
        dispatch(setCurrentSongs(arrayMoveImmutable(currentSongs, oldIndex, newIndex)))
    }, [currentSongs, dispatch])

    const filteredPlaylist = useMemo(() => {
        if (!currentSongs) return []

        const searchTerm = filterPlaylist.toLowerCase().trim()
        if (!searchTerm) return currentSongs

        return currentSongs.filter(song =>
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        )
    }, [currentSongs, filterPlaylist])

    // When first load is complete, set isInitialLoad to false
    useEffect(() => {
        if (animationsComplete.container && animationsComplete.header) {
            const timer = setTimeout(() => {
                setIsInitialLoad(false)
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [animationsComplete])

    const allAnimationsComplete = animationsComplete.container && animationsComplete.header

    if (!currentSongs) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-12"
            >
                <div className="text-center space-y-4">
                    <Spinner
                        size="lg"
                        color="danger"
                        classNames={{
                            circle1: "border-b-rose-400",
                            circle2: "border-b-rose-400"
                        }}
                    />
                    <p className="text-gray-400">{i18next.t('playlist.loading')}</p>
                </div>
            </motion.div>
        )
    }

    const renderItemContainer = (children: React.ReactNode, index: number) => {
        if (isInitialLoad) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: index * 0.05
                    }}
                >
                    {children}
                </motion.div>
            )
        }
        return <div>{children}</div>
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onAnimationComplete={() => setAnimationsComplete(prev => ({ ...prev, container: true }))}
            className="w-full h-full flex flex-col"
        >
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                onAnimationComplete={() => setAnimationsComplete(prev => ({ ...prev, header: true }))}
                className="mb-6 p-4 rounded-xl bg-black/20 border border-rose-500/20 flex-shrink-0"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-red-400 flex items-center justify-center">
                            <IoPlayOutline size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {filteredPlaylist.length} {filteredPlaylist.length === 1 ? i18next.t('playlist.song') : i18next.t('playlist.songs')}
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {filterPlaylist.length > 0 ? i18next.t('playlist.ready_to_play') : i18next.t('playlist.no_songs')}
                            </p>
                        </div>
                    </div>
                    {editMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50"
                        >
                            <span className="text-rose-400 text-sm font-medium">
                                {selectedSongs.length} {i18next.t('playlist.selected')}
                            </span>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {filteredPlaylist.length === 0 ? (
                <Empty filterPlaylist={filterPlaylist} />
            ) : allAnimationsComplete ? (
                <SortableList
                    onSortEnd={onSortEnd}
                    draggedItemClassName="dragged"
                    allowDrag={editMode}
                    className="list h-full"
                >
                    <VirtuosoGrid
                        data={filteredPlaylist}
                        itemContent={(index, song) => (
                            renderItemContainer(
                                <TrackCard
                                    song={song}
                                    onClick={() => handleSongClick(song)}
                                    selected={selectedSongs.includes(song.id)}
                                    toggleSelectedSong={toggleSelectedSong}
                                    position={position}
                                    editMode={editMode}
                                />,
                                index
                            )
                        )}
                        listClassName="grid grid-cols-1 lg:grid-cols-2 gap-3"
                        itemClassName="h-full"
                    />
                </SortableList>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Spinner
                        size="lg"
                        color="danger"
                        classNames={{
                            circle1: "border-b-rose-400",
                            circle2: "border-b-rose-400"
                        }}
                    />
                </div>
            )}
        </motion.div>
    )
}

export default Playlist