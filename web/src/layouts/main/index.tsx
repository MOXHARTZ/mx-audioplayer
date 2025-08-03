import { Navigate, Outlet } from 'react-router-dom'
import Actions from '@/components/actions'
import Header from '@/components/header'
import PlaylistContainer from '@/components/container';
import { useAppSelector } from '@/stores';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
    const { playlist } = useAppSelector(state => state.Main)
    if (!playlist) return <Navigate to="/login" />

    return (
        <div className="relative overflow-hidden">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-rose-900/20"
                animate={{
                    background: [
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                    ]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.section
                className='sm:w-[80vh] md:w-[100vh] xl:w-[105vh] p-6 rounded-2xl text-white bg-black/80 border border-rose-500/20 shadow-2xl'
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.2
                }}
            >
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
            </motion.section>
        </div>
    )
}

export default MainLayout