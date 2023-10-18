import { BiSkipPrevious, BiPause, BiPlay, BiSkipNext } from 'react-icons/bi'
import { FaVolumeDown, FaVolumeUp } from 'react-icons/fa'
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, IconButton } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/stores';
import { setPlaying, setVolume } from '@/stores/Main';
import { toast } from 'react-toastify';
import { handlePlay } from '@/thunks/handlePlay';
import { fetchNui } from '@/utils/fetchNui';
import useNuiEvent from '@/hooks/useNuiEvent';

const Header = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch()
    const [timeStamp, setTimeStamp] = useState(0)
    const { position, playing, volume, playlist } = useAppSelector(state => state.Main)
    const [seeking, setSeeking] = useState<number | false>(false)
    const volumeOnChange = useCallback((_: any, newValue: number | number[]) => {
        dispatch(setVolume(newValue as number));
    }, []);
    useEffect(() => {
        if (position === -1) setTimeStamp(0);
    }, [position])
    function formatDuration(value: number) {
        const minute = Math.floor(value / 60);
        const secondLeft = value - minute * 60;
        const formattedSecond = secondLeft < 10 ? `0${secondLeft}` : secondLeft;
        return `${minute}:${formattedSecond}`;
    }
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

    const currentSong = useAppSelector(state => state.Main.playlist[position])
    return (
        <header className='grid grid-cols-3 w-full justify-between items-center gap-24'>
            <article className='flex flex-row gap-4'>
                <img src={currentSong?.cover ?? 'https://students.senecacollege.ca/assets/Themes/default/images/album-default.png'} className='rounded-lg object-cover w-20 h-20' alt='playlist' />
                <article className='flex flex-col'>
                    <section>
                        <h2>{currentSong?.title ?? 'Title'}</h2>
                        <p className='text-gray-500'>{currentSong?.artist ?? 'Artist'}</p>
                    </section>
                </article>
            </article>
            <article className='w-full flex flex-col'>
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
                <Slider
                    aria-label="time-indicator"
                    size="small"
                    value={seeking !== false ? seeking : timeStamp}
                    min={0}
                    step={1}
                    max={currentSong?.duration ?? 0}
                    onChange={(_, value) => setTimeStamp(value as number)}
                    onChangeCommitted={async (_, value) => {
                        if (!currentSong) return
                        setSeeking(value as number)
                        await fetchNui('seek', {
                            position: value as number
                        })
                        setTimeout(() => {
                            setSeeking(false)
                        }, 1000)
                    }}
                    sx={{
                        color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                        height: 8,
                        '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                            '&:before': {
                                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                            },
                            '&:hover, &.Mui-focusVisible': {
                                boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark'
                                    ? 'rgb(255 255 255 / 16%)'
                                    : 'rgb(0 0 0 / 16%)'
                                    }`,
                            },
                            '&.Mui-active': {
                                width: 16,
                                height: 16,
                            },
                        },
                        '& .MuiSlider-rail': {
                            opacity: 0.28,
                        },
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: -2,
                    }}
                >
                    <p className='text-sm opacity-40 font-medium mt-2'>{formatDuration(timeStamp)}</p>
                    <p className='text-sm opacity-40 font-medium mt-2'>-{formatDuration((currentSong?.duration ?? 0) - timeStamp)}</p>
                </Box>
            </article>
            <article className='w-[80%] m-auto'>
                <Stack
                    spacing={2}
                    direction="row"
                    sx={{
                        mb: 1,
                        // color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.2)',
                        '& .MuiSlider-root': {
                            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                            // width: 100,
                            '& .MuiSlider-thumb': {
                                '&:before': {
                                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                },
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 8px ${theme.palette.mode === 'dark'
                                        ? 'rgb(255 255 255 / 16%)'
                                        : 'rgb(0 0 0 / 16%)'
                                        }`,
                                },
                                '&.Mui-active': {
                                    width: 16,
                                    height: 16,
                                },
                            },
                        },
                    }}
                    alignItems="center">
                    <FaVolumeDown size={24} />
                    <Slider aria-label="Volume" value={volume} max={1} step={0.01} onChange={volumeOnChange} onChangeCommitted={(_, value) => fetchNui('setVolume', { volume: value as number })} />
                    <FaVolumeUp size={24} />
                </Stack>
            </article>

        </header>
    )
}

export default memo(Header)