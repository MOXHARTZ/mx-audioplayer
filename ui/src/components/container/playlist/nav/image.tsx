import { Playlist } from '@/fake-api/playlist-categories'
import { isEmpty } from '@/utils/misc'
import classNames from 'classnames'
import { MdAudiotrack } from 'react-icons/md'

const Image = ({ playlist, className, url }: { playlist?: Playlist, className?: string, url?: string }) => {
    if (!playlist || (!playlist.thumbnail && playlist.songs.length === 0) || url) return (
        <div className={`${className || `w-[4.5rem] h-16 rounded-md flex items-center justify-center bg-zinc-500`}`}>
            {!isEmpty(url) ? <img src={url} alt='playlist' className='w-full h-full object-cover rounded-md pointer-events-none' /> : <MdAudiotrack size={32} className='text-gray-400 rounded-md' />}
        </div>
    )
    if (playlist.thumbnail) return (
        <div className={`${className || 'w-[4.5rem] h-16 rounded-md'}`}>
            <img src={playlist.thumbnail} alt={playlist.name} className='w-full h-full object-cover rounded-md pointer-events-none' />
        </div>
    )
    const firstFourthSongs = playlist.songs.length > 3 ? playlist.songs.slice(0, 4) : [playlist.songs[0]]
    return (
        <div className={classNames({
            'rounded-md grid overflow-hidden object-cover': true,
            className: true,
            'w-[4.5rem] h-16': !className,
            'grid-cols-2': firstFourthSongs.length > 3,
            'grid-cols-1': firstFourthSongs.length <= 3
        })}>
            {firstFourthSongs.map(song => (
                <div key={song.id} style={{
                    backgroundImage: `url(${song.cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}></div>
            ))}
        </div>
    )
}

export default Image