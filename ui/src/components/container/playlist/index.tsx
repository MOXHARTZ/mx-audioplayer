import { useEffect } from 'react'
import { memo, useCallback, useMemo } from 'react'
import Equalizer from '../equalizer'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setCurrentPlaylistId, setCurrentSongs, setPlaying, setSelectedSongs } from '@/stores/Main'
import classNames from 'classnames'
import { Checkbox } from '@mui/material'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Song } from '@/fake-api/song'
import { handlePlay } from '@/thunks/handlePlay'
import { toast } from 'react-toastify'
import i18next from 'i18next'
import { useParams } from 'react-router-dom'
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from 'array-move'

const Playlist = () => {
    const { currentSongs, playing, position, editMode, selectedSongs, volume, filterPlaylist } = useAppSelector(state => state.Main)
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
            <ul ref={animationParent} className='w-full h-full'>
                {_playlist?.length === 0 &&
                    <li className='text-center text-white-500'>
                        {i18next.t('playlist.empty')}
                    </li>
                }
                {_playlist?.map(song => (
                    <SortableItem key={song.id}>
                        <li key={song.id} onClick={() => handleSongClick(song)} className={classNames({
                            'w-full flex items-center border-b gap-4 border-zinc-500 pb-4 last:border-0 hover:bg-zinc-700 p-4 hover:rounded-lg': true,
                            'bg-zinc-700 rounded-lg': position === song.id,
                            'transition-all': !editMode,
                            'cursor-none select-none': editMode
                        })}>
                            <aside>
                                {editMode &&
                                    <Checkbox
                                        onChange={() => toggleSelectedSong(song.id)}
                                        checked={selectedSongs.includes(song.id)}
                                    />
                                }
                            </aside>
                            <aside className='flex justify-between items-center w-full'>
                                <article className='flex flex-row items-center gap-4'>
                                    <img src={song.cover} className='w-16 h-12 pointer-events-none cursor-none' alt='playlist' />
                                    <div className='flex flex-col'>
                                        <h2>{song.title}</h2>
                                        <p className='text-slate-400'>{song.artist}</p>
                                    </div>
                                </article>
                                {playing && position === song.id && <Equalizer />}
                            </aside>
                        </li>
                    </SortableItem>
                ))}
            </ul>
        </SortableList>
    )
}

export default memo(Playlist)