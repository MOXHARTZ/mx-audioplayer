import { useEffect } from 'react'
import { memo, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setCurrentPlaylistId, setCurrentSongs, setPlaying, setSelectedSongs } from '@/stores/Main'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Song } from '@/fake-api/song'
import { handlePlay } from '@/thunks/handlePlay'
import { toast } from 'react-toastify'
import i18next from 'i18next'
import { useParams } from 'react-router-dom'
import SortableList from "react-easy-sort";
import { arrayMoveImmutable } from 'array-move'
import TrackCard from './TrackCard'

const Playlist = () => {
    const { currentSongs, position, editMode, selectedSongs, volume, filterPlaylist } = useAppSelector(state => state.Main)
    const { playlistId } = useParams() as { playlistId: string }
    const dispatch = useAppDispatch()
    const [animationParent, enableAnimations] = useAutoAnimate()
    const setCurrentSong = useCallback((id: string) => {
        if (id === position) return toast.error(i18next.t('playlist.song_already_playing'))
        dispatch(setPlaying(false))
        const soundData = currentSongs?.find(song => song.id === id)
        if (!soundData) return toast.error(i18next.t('playlist.song_not_exist'))
        dispatch(handlePlay({
            position: id,
            soundData,
            volume
        }))
    }, [currentSongs, position])
    const toggleSelectedSong = useCallback((id: string) => {
        if (selectedSongs.includes(id)) {
            dispatch(setSelectedSongs(selectedSongs.filter(song => song !== id)))
        } else {
            dispatch(setSelectedSongs([...selectedSongs, id]))
        }
    }, [selectedSongs])
    const handleSongClick = useCallback((song: Song) => {
        if (editMode) {
            toggleSelectedSong(song.id)
            return
        }
        setCurrentSong(song.id)
    }, [editMode, selectedSongs, currentSongs, position])
    useEffect(() => {
        dispatch(setCurrentPlaylistId(playlistId))
    }, [playlistId])
    const onSortEnd = (oldIndex: number, newIndex: number) => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'));
        dispatch(setCurrentSongs(arrayMoveImmutable(currentSongs, oldIndex, newIndex)))
    };
    useEffect(() => {
        enableAnimations(!editMode)
    }, [editMode])
    const _playlist = useMemo(() => currentSongs?.filter(song => song.title.toLowerCase().includes(filterPlaylist.toLowerCase()) || song.artist.toLowerCase().includes(filterPlaylist.toLowerCase())), [currentSongs, filterPlaylist])
    return (
        <SortableList
            onSortEnd={onSortEnd}
            className="list flex flex-col gap-2"
            draggedItemClassName="dragged"
            allowDrag={editMode}
        >
            <ul ref={animationParent} className='w-full h-full grid grid-cols-2 gap-4'>
                {_playlist?.length === 0 &&
                    <li className='text-center text-white-500'>
                        {i18next.t('playlist.empty')}
                    </li>
                }
                {_playlist?.map(song => (
                    <TrackCard
                        key={song.id}
                        song={song}
                        onClick={() => handleSongClick(song)}
                        selected={selectedSongs.includes(song.id)}
                        toggleSelectedSong={toggleSelectedSong}
                        position={position}
                        editMode={editMode}
                    />
                ))}
            </ul>
        </SortableList>
    )
}

export default memo(Playlist)