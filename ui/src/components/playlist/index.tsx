import { memo, useCallback, useMemo } from 'react'
import Equalizer from './equalizer'
import { useAppDispatch, useAppSelector } from '@/stores'
import { setPlaying, setSelectedSongs } from '@/stores/Main'
import classNames from 'classnames'
import { Checkbox } from '@mui/material'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Song } from '@/fake-api/song'
import { handlePlay } from '@/thunks/handlePlay'
import { toast } from 'react-toastify'
import i18next from 'i18next'

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

const Playlist = () => {
    const { playlist, playing, position, editMode, selectedSongs, volume, filterPlaylist } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
    const setCurrentSong = useCallback((id: string) => {
        if (id === position) return toast.error(i18next.t('playlist.song_already_playing'))
        dispatch(setPlaying(false))
        const soundData = playlist.find(song => song.id === id)
        if (!soundData) return toast.error(i18next.t('playlist.song_not_exist'))
        dispatch(handlePlay({
            position: id,
            soundData: soundData,
            volume
        }))
    }, [playlist, position])
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
    }, [editMode, selectedSongs, playlist, position])
    const _playlist = useMemo(() => playlist.filter(song => song.title.toLowerCase().includes(filterPlaylist.toLowerCase()) || song.artist.toLowerCase().includes(filterPlaylist.toLowerCase())), [playlist, filterPlaylist])
    return (
        <section className='bg-zinc-600 p-4 rounded-lg mt-5 gap-4 flex flex-col overflow-y-auto overflow-x-hidden md:h-[calc(100vh-24rem)] xl:h-[calc(100vh-28rem)] sm:h-[calc(100vh-24rem)]'>
            <ul ref={animationParent} className='w-full h-full'>
                {_playlist.map(song => (
                    <li key={song.id} onClick={() => handleSongClick(song)} className={classNames({
                        'w-full flex items-center border-b gap-4 border-zinc-500 pb-4 last:border-0 cursor-pointer hover:bg-zinc-700 p-4 hover:rounded-lg transition-all': true,
                        'bg-zinc-700 rounded-lg': position === song.id
                    })}>
                        <aside>
                            {editMode &&
                                <Checkbox
                                    {...label}
                                    onChange={() => toggleSelectedSong(song.id)}
                                    checked={selectedSongs.includes(song.id)}
                                />
                            }
                        </aside>
                        <aside className='flex justify-between items-center w-full'>
                            <article className='flex flex-row items-center gap-4'>
                                <img src={song.cover} className='w-16 h-12' alt='playlist' />
                                <div className='flex flex-col'>
                                    <h2>{song.title}</h2>
                                    <p className='text-slate-400'>{song.artist}</p>
                                </div>
                            </article>
                            {playing && position === song.id && <Equalizer />}
                        </aside>
                    </li>
                ))}
            </ul>
        </section>

    )
}

export default memo(Playlist)