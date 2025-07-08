import { Navigate, Outlet } from 'react-router-dom'
import Actions from '@/components/actions'
import Header from '@/components/header'
import PlaylistContainer from '@/components/container';
import { useEffect } from 'react';
import { useAppSelector } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const { playlist } = useAppSelector(state => state.Main)
    if (!playlist) return <Navigate to="/login" />

    return (
        <motion.section
            className='sm:w-[80vh] md:w-[100vh] xl:w-[105vh] p-6 rounded-lg text-white bg-gradient-to-br from-black/90 via-gray-900/90 to-rose-900/20 border border-rose-500/20 shadow-2xl'
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.4
            }}
        >
            <AnimatePresence mode="wait">
                {playlist && (
                    <motion.div
                        key="main-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                        }}
                        className="space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 20,
                                delay: 0.2
                            }}
                        >
                            <Header />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 20,
                                delay: 0.4
                            }}
                        >
                            <Actions />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 150,
                                damping: 20,
                                delay: 0.6
                            }}
                        >
                            <PlaylistContainer />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div
                    key="outlet"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                >
                    <Outlet />
                </motion.div>
            </AnimatePresence>
        </motion.section >
    )
}

export default MainLayout