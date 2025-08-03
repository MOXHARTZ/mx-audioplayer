import { motion } from 'framer-motion'
import i18next from 'i18next'
import { IoMusicalNotesOutline } from 'react-icons/io5'
import { Chip } from '@heroui/react'

type EmptyProps = {
    filterPlaylist: string;
}

export default function Empty({ filterPlaylist }: EmptyProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
        >
            <motion.div
                animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-400 flex items-center justify-center"
            >
                <IoMusicalNotesOutline size={32} className="text-white" />
            </motion.div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-white">
                    {i18next.t('playlist.empty')}
                </h3>
                <p className="text-gray-400 text-sm">
                    {filterPlaylist ? i18next.t('playlist.no_song_match') : i18next.t('playlist.add_some_songs')}
                </p>
            </div>
            <Chip
                color="danger"
                variant="shadow"
                className="bg-black/20 border border-rose-500/20 text-rose-400"
            >
                {filterPlaylist ? i18next.t('playlist.no_results') : i18next.t('playlist.empty')}
            </Chip>
        </motion.div>
    )
}
