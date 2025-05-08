import { useAppSelector } from '@/stores'
import { memo, useEffect, useState } from 'react'
import i18next from 'i18next'
import { Image } from '@heroui/react'
import Volume from './volume'
import { useAutoAnimate } from '@formkit/auto-animate/react'

type InfoProps = {
    isShort?: boolean
}

const Info = ({ isShort }: InfoProps) => {
    const { currentSongData, volume } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    const [showVolume, setShowVolume] = useState(false)
    const [animationParent] = useAutoAnimate()

    useEffect(() => {
        if (!isShort) return
        setShowVolume(true)
        const timeout = setTimeout(() => {
            setShowVolume(false)
        }, 2000)
        return () => {
            clearTimeout(timeout)
            setShowVolume(false)
        }
    }, [volume])
    return (
        <article className='flex justify-between items-center w-full' ref={animationParent}>
            {(isShort && showVolume) ? (
                <Volume isShort />
            ) : null}
            <aside className='flex gap-4 items-center'>
                <Image
                    src={currentSong?.cover ?? 'https://heroui.com/images/album-cover.png'}
                    className='rounded-lg object-cover'
                    width={120}
                    alt='playlist'
                    isBlurred
                />
                {!isShort && (
                    <article className='flex flex-col'>
                        <section>
                            <h2>{currentSong?.title ?? i18next.t('header.title')}</h2>
                            <p className='text-gray-500'>{currentSong?.artist ?? i18next.t('header.artist')}</p>
                        </section>
                    </article>
                )}
            </aside>
        </article>
    )
}

export default memo(Info)