import { useAppSelector } from '@/stores'
import { memo } from 'react'
import i18next from 'i18next'


const Info = () => {
    const { playlist, position } = useAppSelector(state => state.Main)
    const currentSong = playlist.find(song => song.id === position)
    return (
        <article className='flex flex-row gap-4'>
            <img src={currentSong?.cover ?? 'https://students.senecacollege.ca/assets/Themes/default/images/album-default.png'} className='rounded-lg object-cover w-20 h-20' alt='playlist' />
            <article className='flex flex-col'>
                <section>
                    <h2>{currentSong?.title ?? i18next.t('header.title')}</h2>
                    <p className='text-gray-500'>{currentSong?.artist ?? i18next.t('header.artist')}</p>
                </section>
            </article>
        </article>
    )
}

export default memo(Info)