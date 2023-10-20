import { FC, memo, useCallback, useEffect } from 'react';
import useNuiEvent from '@/hooks/useNuiEvent';
import { setPlaying } from '@/stores/Main';
import { handlePlay } from '@/thunks/handlePlay';
import { BiSkipPrevious, BiPause, BiPlay, BiSkipNext } from 'react-icons/bi'
import { Box, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/stores';


const Control: FC<{ timeStamp: number; setTimeStamp: Function }> = ({ timeStamp, setTimeStamp }) => {
    const dispatch = useAppDispatch()
    const { position, playing, volume, playlist } = useAppSelector(state => state.Main)
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
    const nextBtn = useCallback(async () => {
        const index = playlist.findIndex(song => song.id === currentSong?.id)
        const newPos = index === playlist.length - 1 ? 0 : index + 1
        if (playlist.length === 0) return toast.error('Playlist is empty');
        if (playlist[newPos].id === currentSong?.id) return toast.error('No more songs in playlist');
        dispatch(setPlaying(false))
        dispatch(handlePlay({
            position: newPos,
            soundData: playlist[newPos],
            volume: volume
        }))
    }, [position, playlist, volume])
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => {
        setTimeStamp(time)
        const duration = playlist[position]?.duration ?? 0
        if (playing && duration && timeStamp === duration) {
            if (!playlist[position + 1]) return;
            nextBtn()
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
            <IconButton aria-label="next song" onClick={nextBtn}>
                <BiSkipNext size={40} color='#fff' />
            </IconButton>
        </Box>
    )
}

export default memo(Control)