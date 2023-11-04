import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import useNuiEvent from '@/hooks/useNuiEvent';
import { setPlaying, setRepeat, setShuffle } from '@/stores/Main';
import { handlePlay } from '@/thunks/handlePlay';
import { BiSkipPrevious, BiPause, BiPlay, BiSkipNext, BiShuffle, BiRepeat } from 'react-icons/bi'
import { Box, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import memoize from "fast-memoize";


const Control: FC<{ timeStamp: number; setTimeStamp: Function }> = ({ timeStamp, setTimeStamp }) => {
    const dispatch = useAppDispatch()
    const { position, playing, volume, playlist, shuffle, repeat } = useAppSelector(state => state.Main)
    const currentSong = playlist[position]
    const previousBtn = useCallback(async () => {
        const index = playlist.findIndex(song => song.id === currentSong?.id)
        const newPos = index === 0 ? playlist.length - 1 : index - 1
        if (playlist.length === 0) return toast.error('Playlist is empty');
        if (playlist[newPos].id === currentSong?.id) return toast.error('No more songs in playlist');
        dispatch(setPlaying(false))
        dispatch(handlePlay({
            position: newPos,
            soundData: playlist[newPos],
            volume
        }))
    }, [position, playlist, volume])
    const nextBtn = useMemo(() => memoize((checkShuffle) => {
        const index = playlist.findIndex(song => song.id === currentSong?.id)
        let newPos = index === playlist.length - 1 ? 0 : index + 1
        if (checkShuffle && shuffle && playlist.length > 2) {
            newPos = Math.floor(Math.random() * playlist.length)
            while (newPos === index) {
                newPos = Math.floor(Math.random() * playlist.length)
            }
        }
        if (playlist.length === 0) return toast.error('Playlist is empty');
        if (playlist[newPos].id === currentSong?.id) return toast.error('No more songs in playlist');
        dispatch(setPlaying(false))
        dispatch(handlePlay({
            position: newPos,
            soundData: playlist[newPos],
            volume: volume
        }))
    }), [position, playlist, volume])
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => {
        setTimeStamp(time)
        const duration = playlist[position]?.duration ?? 0
        if (playing && duration && timeStamp === duration) {
            if (repeat) {
                setTimeStamp(0)
                fetchNui('seek', {
                    position: 0
                })
                return
            }
            if (playlist.length === 0) return;
            nextBtn(true)
        }
    })
    useEffect(() => {
        if (position === -1) setTimeStamp(0);
    }, [position])
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: -1,
            }}
        >
            <IconButton aria-label="shuffle" onClick={() => dispatch(setShuffle(!shuffle))}>
                <BiShuffle size={24} color={shuffle ? '#3b82f6' : '#fff'} />
            </IconButton>
            <IconButton aria-label="previous song" onClick={previousBtn}>
                <BiSkipPrevious size={40} color='#fff' />
            </IconButton>
            <IconButton
                aria-label={playing ? 'pause' : 'play'}
                onClick={() => position !== -1 && dispatch(setPlaying(!playing))}
            >
                {playing ? (
                    <BiPause size={54} color='#fff' />
                ) : (
                    <BiPlay size={54} color='#fff' />
                )}
            </IconButton>
            <IconButton aria-label="next song" onClick={() => nextBtn(true)}>
                <BiSkipNext size={40} color='#fff' />
            </IconButton>
            <IconButton aria-label="repeat" onClick={() => dispatch(setRepeat(!repeat))}>
                <BiRepeat size={24} color={repeat ? '#3b82f6' : '#fff'} />
            </IconButton>
        </Box>
    )
}

export default memo(Control)