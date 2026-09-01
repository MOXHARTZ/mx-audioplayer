import { IoMusicalNotesOutline } from 'react-icons/io5';
import { cn, isEmpty } from '@/lib/utils';
import CoverImage from './CoverImage';
import type { Playlist } from '@/types';

interface PlaylistCoverProps {
    playlist?: Playlist;
    url?: string;
    className?: string;
    rounded?: string;
}

const PlaylistCover = ({ playlist, url, className, rounded = 'rounded-lg' }: PlaylistCoverProps) => {
    const base = cn('overflow-hidden shrink-0 bg-ink-1 border border-ink-3/60', rounded, className);

    const image = !isEmpty(url) ? url : playlist?.thumbnail;
    if (image) {
        return (
            <div className={base}>
                <CoverImage src={image} alt={playlist?.name ?? 'playlist'} className="w-full h-full object-cover" />
            </div>
        );
    }

    const songs = playlist?.songs ?? [];
    if (songs.length === 0) {
        return (
            <div className={cn(base, 'flex items-center justify-center')}>
                <IoMusicalNotesOutline className="text-ink-4 w-1/3 h-1/3" />
            </div>
        );
    }

    if (songs.length < 4) {
        return (
            <div className={base}>
                <CoverImage src={songs[0].cover} alt={playlist?.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className={cn(base, 'grid grid-cols-2')}>
            {songs.slice(0, 4).map(song => (
                <CoverImage
                    key={song.id}
                    src={song.cover}
                    className="w-full h-full object-cover"
                />
            ))}
        </div>
    );
};

export default PlaylistCover;
