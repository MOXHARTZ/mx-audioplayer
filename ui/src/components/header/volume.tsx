import { useAppDispatch, useAppSelector } from '@/stores';
import { setVolume } from '@/stores/Main';
import { fetchNui } from '@/utils/fetchNui';
import { Slider, Stack, useTheme } from '@mui/material';
import { memo, useCallback } from 'react'
import { FaVolumeDown, FaVolumeUp } from 'react-icons/fa';

const Volume = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch()
    const { volume } = useAppSelector(state => state.Main)
    const volumeOnChange = useCallback((_: unknown, newValue: number | number[]) => {
        dispatch(setVolume(newValue as number));
    }, []);
    return (
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
    )
}

export default memo(Volume)