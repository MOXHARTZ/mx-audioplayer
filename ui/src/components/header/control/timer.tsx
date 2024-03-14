import { useAppSelector } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import { formatDuration } from '@/utils/misc';
import { Box, Slider, useTheme } from '@mui/material';
import { FC, memo, useState } from 'react'

const Timer: FC<{ timeStamp: number; setTimeStamp: (seek: number) => void }> = ({ timeStamp, setTimeStamp }) => {
    const theme = useTheme();
    const [seeking, setSeeking] = useState<number | false>(false)
    const { currentSongData } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    return (
        <>
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
        </>
    )
}

export default memo(Timer)