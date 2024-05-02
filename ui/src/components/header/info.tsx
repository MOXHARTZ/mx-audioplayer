import { useAppSelector } from '@/stores'
import { memo } from 'react'
import i18next from 'i18next'
import { Card, Image } from '@nextui-org/react'
import Volume from './volume'

const Info = () => {
    const { currentSongData } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    return (
        <article className='flex justify-between items-center w-full'>
            <aside className='flex gap-4 items-center'>
                <Image
                    src={currentSong?.cover ?? 'https://nextui.org/images/album-cover.png'}
                    className='rounded-lg object-cover'
                    width={120}
                    alt='playlist'
                    isBlurred
                />
                <article className='flex flex-col'>
                    <section>
                        <h2>{currentSong?.title ?? i18next.t('header.title')}</h2>
                        <p className='text-gray-500'>{currentSong?.artist ?? i18next.t('header.artist')}</p>
                    </section>
                </article>
            </aside>
        </article>
    )
}

export default memo(Info)