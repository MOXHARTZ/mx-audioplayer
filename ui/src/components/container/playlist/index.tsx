import { useEffect, memo, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setCurrentPlaylistId, setCurrentSongs, setPlaying, setSelectedSongs } from '@/stores/Main'
import { Song } from '@/fake-api/song'
import { handlePlay } from '@/thunks/handlePlay'
import { toast } from 'react-toastify'
import i18next from 'i18next'
import { useParams } from 'react-router-dom'
import SortableList from "react-easy-sort";
import { arrayMoveImmutable } from 'array-move'
import TrackCard from './TrackCard'
import { Chip, Spinner } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoMusicalNotesOutline, IoPlayOutline } from 'react-icons/io5'

const Playlist = () => {
    const { currentSongs, position, editMode, selectedSongs, volume, filterPlaylist, playing } = useAppSelector(state => state.Main)
    const { playlistId } = useParams() as { playlistId: string }
    const dispatch = useAppDispatch()

    const setCurrentSong = useCallback((id: string) => {
        if (id === position) {
            dispatch(setPlaying(!playing))
            return
        }

        dispatch(setPlaying(false))
        const soundData = currentSongs?.find(song => song.id === id)

        if (!soundData) {
            toast.error(i18next.t('playlist.song_not_exist'))
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
    }, [playlistId, dispatch])

    const onSortEnd = useCallback((oldIndex: number, newIndex: number) => {
        if (!currentSongs) {
            toast.error(i18next.t('playlist.select_playlist'))
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

    const EmptyState = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
        >
            <motion.div
                animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-400 flex items-center justify-center"
            >
                <IoMusicalNotesOutline size={32} className="text-white" />
            </motion.div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">
                    {i18next.t('playlist.empty')}
                </h3>
                <p className="text-gray-400 text-sm">
                    {filterPlaylist ? i18next.t('playlist.no_song_match') : i18next.t('playlist.add_some_songs')}
                </p>
            </div>
            <Chip
                color="danger"
                variant="shadow"
                className="bg-black/20 border border-rose-500/20 text-rose-400"
            >
                {filterPlaylist ? i18next.t('playlist.no_results') : i18next.t('playlist.empty')}
            </Chip>
        </motion.div>
    )

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full h-full"
        >
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="mb-6 p-4 rounded-xl bg-black/20 border border-rose-500/20"
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
            <SortableList
                onSortEnd={onSortEnd}
                className="list flex flex-col gap-3"
                draggedItemClassName="dragged"
                allowDrag={editMode}
            >
                <AnimatePresence mode="wait">
                    {filteredPlaylist.length === 0 ? (
                        <EmptyState key="empty" />
                    ) : (
                        <motion.div
                            key="tracks"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-3"
                        >
                            {filteredPlaylist.map((song, index) => (
                                <motion.div
                                    key={song.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: index * 0.05
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <TrackCard
                                        song={song}
                                        onClick={() => handleSongClick(song)}
                                        selected={selectedSongs.includes(song.id)}
                                        toggleSelectedSong={toggleSelectedSong}
                                        position={position}
                                        editMode={editMode}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </SortableList>
        </motion.div>
    )
}

export default memo(Playlist)