
import { memo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Playlist from './playlist'
import PlaylistNav from './playlist/nav'
import { useAutoAnimate } from '@formkit/auto-animate/react'

const PlaylistContainer = () => {
    const location = useLocation()
    const [parent] = useAutoAnimate()
    return (
        <article className='flex items-center justify-center md:h-[calc(100vh-24rem)] xl:h-[calc(100vh-28rem)] sm:h-[calc(100vh-24rem)] w-full gap-2'>
            <PlaylistNav />
            <section ref={parent} className='bg-zinc-600 p-4 rounded-lg gap-4 flex flex-col overflow-y-auto overflow-x-hidden h-full w-full'>
                <Routes location={location} key={location.pathname}>
                    <Route path='/playlist/:playlistId' element={<Playlist />} />
                </Routes>
            </section>
        </article>


    )
}

export default memo(PlaylistContainer)