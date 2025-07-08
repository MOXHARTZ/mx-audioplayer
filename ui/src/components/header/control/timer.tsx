import { useAppSelector } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import { formatDuration } from '@/utils/misc';
import { Slider } from '@heroui/react';
import { FC, memo, useState } from 'react'

const Timer: FC<{ timeStamp: number; setTimeStamp: (seek: number) => void }> = ({ timeStamp, setTimeStamp }) => {
    const [seeking, setSeeking] = useState<number | false>(false)
    const { currentSongData } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    return (
        <section className='w-96 m-auto group overflow-hidden'>
            <div className="relative">
                <Slider
                    aria-label="time-indicator"
                    value={seeking !== false ? seeking : timeStamp}
                    maxValue={currentSong?.duration ?? 0}
                    step={0.01}
                    size='sm'
                    onChange={(value) => setTimeStamp(Math.round(value as number))}
                    onChangeEnd={async (value) => {
                        if (!currentSong) return
                        setSeeking(value as number)
                        await fetchNui('seek', {
                            position: value as number
                        })
                        setTimeout(() => {
                            setSeeking(false)
                        }, 1000)
                    }}
                    color='foreground'
                    classNames={{
                        track: "bg-default-500/30 transition-all duration-300 ease-out group-hover:bg-default-500/50",
                        thumb: "w-4 h-4 after:w-4 after:h-4 after:bg-foreground transition-all duration-300 ease-out hover:scale-125 hover:shadow-lg hover:shadow-foreground/30",
                        filler: "transition-all duration-300 ease-out",
                    }}
                />
            </div>

            <footer className='flex items-center justify-between mt-2'>
                <p className='text-sm opacity-40 font-medium transition-all duration-300 ease-out group-hover:opacity-80 group-hover:scale-105'>
                    {formatDuration(timeStamp)}
                </p>
                <p className='text-sm opacity-40 font-medium transition-all duration-300 ease-out group-hover:opacity-80 group-hover:scale-105'>
                    -{formatDuration((currentSong?.duration ?? 0) - timeStamp)}
                </p>
            </footer>
        </section>
    )
}

export default memo(Timer)