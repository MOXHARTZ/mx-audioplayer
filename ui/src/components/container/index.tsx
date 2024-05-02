
import { memo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Playlist from './playlist'
import PlaylistNav from './playlist/nav'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import classNames from 'classnames'
import { useAppSelector } from '@/stores'

const PlaylistContainer = () => {
    const location = useLocation()
    const [parent] = useAutoAnimate()
    const { waitingForResponse } = useAppSelector(state => state.Main)
    return (
        <article className={classNames({
            'flex items-center justify-center md:h-[calc(100vh-24rem)] xl:h-[calc(100vh-28rem)] sm:h-[calc(100vh-24rem)] w-full gap-2': true,
            'cursor-none pointer-events-none': waitingForResponse
        })}>
            <PlaylistNav />
            <section ref={parent} className='bg-default-200/50 shadow-xl p-4 rounded-md gap-4 flex flex-col overflow-y-auto overflow-x-hidden h-full w-full'>
                <Routes location={location} key={location.pathname}>
                    <Route path='/playlist/:playlistId' element={<Playlist />} />
                </Routes>
            </section>
        </article>


    )
}

export default memo(PlaylistContainer)