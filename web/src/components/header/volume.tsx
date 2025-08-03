import { useAppDispatch, useAppSelector } from '@/stores';
import { setVolume } from '@/stores/Main';
import { fetchNui } from '@/utils/fetchNui';
import { Slider } from '@heroui/react';
import classNames from 'classnames';
import { useEffect, useState } from 'react'
import { IoVolumeHigh, IoVolumeLow } from 'react-icons/io5';

type VolumeProps = {
    isShort?: boolean
}

const Volume = ({ isShort }: VolumeProps) => {
    const dispatch = useAppDispatch()
    const { volume } = useAppSelector(state => state.Main)
    const [tempVolume, setTempVolume] = useState(volume)
    const onChangeEnd = (value: number) => {
        fetchNui('setVolume', { volume: value })
        dispatch(setVolume(value))
    }

    // PURPOSE: When player change volume in short display, volume is updating with this
    // otherwise, volume will not update
    useEffect(() => {
        setTempVolume(volume)
    }, [volume])

    return (
        <article className={classNames({
            'w-64 flex items-center gap-3 justify-self-end': true,
            'flex-col w-auto mr-4 h-full': isShort
        })}>
            <IoVolumeLow size={isShort ? 24 : 32} />
            <Slider
                aria-label="Volume"
                value={tempVolume}
                maxValue={1}
                step={0.01}
                orientation={isShort ? 'vertical' : 'horizontal'}
                size='sm'
                onChange={(value) => setTempVolume(value as number)}
                color='foreground'
                onChangeEnd={(value) => onChangeEnd(value as number)}
                classNames={{
                    base: `${isShort ? 'h-full w-auto' : 'w-64'}`,
                    track: "bg-default-500/30",
                    thumb: "w-4 h-4 after:w-4 after:h-4 after:bg-foreground",
                }}
            />
            <IoVolumeHigh size={isShort ? 24 : 32} />
        </article>
    )
}

export default Volume