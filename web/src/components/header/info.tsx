import { useAppSelector } from '@/stores'
import { memo, useEffect, useState } from 'react'
import i18next from 'i18next'
import { Image } from '@heroui/react'
import Volume from './volume'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useAutoAnimate } from '@formkit/auto-animate/react'

type InfoProps = {
    isShort?: boolean
}

const Info = ({ isShort }: InfoProps) => {
    const { currentSongData, volume } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    const [showVolume, setShowVolume] = useState(false)
    const [autoAnimate] = useAutoAnimate()

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
        <LayoutGroup>
            <motion.article
                className='flex justify-between items-center w-full overflow-hidden'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.6
                }}
                layout
            >
                <AnimatePresence mode="wait">
                    {(isShort && showVolume) ? (
                        <motion.div
                            key="volume"
                            layout
                            initial={{ opacity: 0, scale: 0.8, x: -30 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: -30 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                                duration: 0.5
                            }}
                            className="flex-shrink-0 h-full"
                        >
                            <Volume isShort />
                        </motion.div>
                    ) : null}
                </AnimatePresence>


                <motion.aside
                    className='flex gap-4 items-center'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        x: 0
                    }}
                    transition={{
                        duration: 0.6,
                    }}
                    // Just animate when short display is enabled
                    layout={!!isShort}
                >
                    <Image
                        src={currentSong?.cover}
                        fallbackSrc='https://www.heroui.com/images/album-cover.png'
                        loading='lazy'
                        className='rounded-lg bg-center'
                        classNames={{
                            wrapper: 'w-full h-full bg-center bg-contain',
                        }}
                        width={120}
                        height={120}
                        alt='playlist'
                        isBlurred
                    />

                    {!isShort && (
                        <article className='flex flex-col'>
                            <h2 className="text-xl font-semibold text-white">
                                {currentSong?.title ?? i18next.t('header.title')}
                            </h2>
                            <p className='text-gray-500 mt-1'>
                                {currentSong?.artist ?? i18next.t('header.artist')}
                            </p>
                        </article>
                    )}
                </motion.aside>
            </motion.article>
        </LayoutGroup>
    )
}

export default memo(Info)