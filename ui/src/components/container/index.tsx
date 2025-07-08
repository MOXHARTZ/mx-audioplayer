import { memo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Playlist from './playlist'
import PlaylistNav from './playlist/nav'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import classNames from 'classnames'
import { useAppSelector } from '@/stores'
import { motion } from 'framer-motion'

const PlaylistContainer = () => {
    const location = useLocation()
    const [parent] = useAutoAnimate()
    const { waitingForResponse, playlist } = useAppSelector(state => state.Main)
    return (
        <motion.article
            className={classNames({
                'flex md:h-[calc(100vh-24rem)] xl:h-[calc(100vh-28rem)] sm:h-[calc(100vh-24rem)] w-full gap-2': true,
                'cursor-none pointer-events-none': waitingForResponse
            })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            {playlist && (
                <>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    >
                        <PlaylistNav />
                    </motion.div>
                    <motion.section
                        ref={parent}
                        className='bg-black/20 border border-rose-500/20 shadow-xl p-4 rounded-xl gap-4 flex flex-col overflow-y-auto overflow-x-hidden h-full w-full'
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    >
                        <Routes location={location} key={location.pathname}>
                            <Route path='/playlist/:playlistId' element={<Playlist />} />
                        </Routes>
                    </motion.section>
                </>
            )}
        </motion.article>
    )
}

export default memo(PlaylistContainer)