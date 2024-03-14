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
import i18next from 'i18next';

const Control: FC<{ timeStamp: number; setTimeStamp: (seek: number) => void }> = ({ timeStamp, setTimeStamp }) => {
    const dispatch = useAppDispatch()
    const { position, playing, volume, playlist, shuffle, repeat, currentSongData } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    const currentSongChildren = playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.songs
    const previousBtn = useCallback(async () => {
        if (!currentSongChildren) return toast.error(i18next.t('playlist.empty'));
        const index = currentSongChildren.findIndex(song => song.id === currentSong?.id)
        const newPos = index === 0 ? currentSongChildren.length - 1 : index - 1
        if (currentSongChildren.length === 0) return toast.error(i18next.t('playlist.empty'))
        const newSoundData = currentSongChildren[newPos]
        if (newSoundData.id === currentSong?.id) return toast.error(i18next.t('playlist.no_more_songs'))
        dispatch(setPlaying(false))

        dispatch(handlePlay({
            position: newSoundData.id,
            soundData: newSoundData,
            volume,
            playlistId: currentSongData?.playlistId
        }))
    }, [position, currentSongChildren, volume, currentSongData])
    const nextBtn = useMemo(() => memoize((checkShuffle) => {
        if (!currentSongChildren) return toast.error(i18next.t('playlist.empty'));
        const index = currentSongChildren.findIndex(song => song.id === currentSong?.id)
        let newPos = index === currentSongChildren.length - 1 ? 0 : index + 1
        if (checkShuffle && shuffle && currentSongChildren.length > 2) {
            newPos = Math.floor(Math.random() * currentSongChildren.length)
            while (newPos === index) {
                newPos = Math.floor(Math.random() * currentSongChildren.length)
            }
        }
        if (currentSongChildren.length === 0) return toast.error(i18next.t('playlist.empty'))
        const newSoundData = currentSongChildren[newPos]
        if (newSoundData.id === currentSong?.id) return toast.error(i18next.t('playlist.no_more_songs'))
        dispatch(setPlaying(false))
        dispatch(handlePlay({
            position: newSoundData.id,
            soundData: newSoundData,
            volume: volume,
            playlistId: currentSongData?.playlistId
        }))
    }), [position, currentSongChildren, volume, currentSongData])
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => {
        setTimeStamp(time)
        const duration = currentSong?.duration ?? 0
        if (playing && duration && timeStamp === duration) {
            if (repeat) {
                setTimeStamp(0)
                fetchNui('seek', {
                    position: 0
                })
                return
            }
            if (currentSongChildren?.length === 0) return;
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