import { Playlist } from '@/fake-api/playlist-categories'
import { isEmpty } from '@/utils/misc'
import { Image } from '@heroui/react'
import classNames from 'classnames'
import { MdAudiotrack } from 'react-icons/md'
import { motion } from 'framer-motion'

const PlaylistImage = ({ playlist, className, url }: { playlist?: Playlist, className?: string, url?: string }) => {
    if (!playlist || (!playlist.thumbnail && playlist.songs.length === 0) || url) return (
        <motion.div
            className={`${className || `w-[4.5rem] h-16 rounded-lg flex items-center justify-center bg-black/20 border border-rose-500/20`}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {!isEmpty(url) ? (
                <Image
                    src={url}
                    alt='playlist'
                    className='w-full h-full object-cover rounded-lg pointer-events-none'
                />
            ) : (
                <MdAudiotrack size={32} className='text-rose-400' />
            )}
        </motion.div>
    )

    if (playlist.thumbnail) return (
        <motion.div
            className={`${className || 'w-[4.5rem] h-16 rounded-lg'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Image
                src={playlist.thumbnail}
                alt={playlist.name}
                className='w-full h-full object-cover rounded-lg pointer-events-none'
            />
        </motion.div>
    )

    const firstFourthSongs = playlist.songs.length > 3 ? playlist.songs.slice(0, 4) : [playlist.songs[0]]
    return (
        <motion.div
            className={classNames({
                'rounded-lg grid overflow-hidden object-cover border border-rose-500/20': true,
                className: true,
                'w-[4.5rem] h-16': !className,
                'grid-cols-2': firstFourthSongs.length > 3,
                'grid-cols-1': firstFourthSongs.length <= 3
            })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {firstFourthSongs.map(song => (
                <div key={song.id} style={{
                    backgroundImage: `url(${song.cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}></div>
            ))}
        </motion.div>
    )
}

export default PlaylistImage