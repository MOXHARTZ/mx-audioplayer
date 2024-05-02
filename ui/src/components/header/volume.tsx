import { useAppDispatch, useAppSelector } from '@/stores';
import { setVolume } from '@/stores/Main';
import { fetchNui } from '@/utils/fetchNui';
import { Slider } from '@nextui-org/react';
import { memo, useCallback } from 'react'
import { IoVolumeHigh, IoVolumeLow } from 'react-icons/io5';

const Volume = () => {
    const dispatch = useAppDispatch()
    const { volume } = useAppSelector(state => state.Main)
    const volumeOnChange = useCallback((newValue: number | number[]) => {
        dispatch(setVolume(newValue as number));
    }, []);
    return (
        <article className='w-64 flex items-center gap-3 justify-self-end'>
            <IoVolumeLow size={32} />
            <Slider
                aria-label="Volume"
                value={volume}
                maxValue={1}
                step={0.01}
                size='sm'
                onChange={volumeOnChange}
                color='foreground'
                onChangeEnd={(value) => fetchNui('setVolume', { volume: value as number })}
                classNames={{
                    track: "bg-default-500/30",
                    thumb: "w-4 h-4 after:w-4 after:h-4 after:bg-foreground",
                }}
            />
            <IoVolumeHigh size={32} />
        </article>
    )
}

export default memo(Volume)