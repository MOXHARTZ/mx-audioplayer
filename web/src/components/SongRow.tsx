import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IoPlaySharp, IoReorderTwoOutline, IoHeart, IoHeartOutline,
    IoListOutline, IoPlayForwardOutline, IoAddOutline, IoArrowForwardOutline, IoTrashOutline,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';
import { LIKED_ID, RADIO_ID, isReservedPlaylist } from '@/lib/reserved';
import { writeSongDrag } from '@/lib/drag';
import CoverImage from './CoverImage';
import ContextMenu, { type MenuItem } from './ui/ContextMenu';
import Spinner from './ui/Spinner';
import type { Song } from '@/types';

interface SongRowProps {
    song: Song;
    index: number;
    playlistId: string | number;
    isCurrent: boolean;
    isPlaying: boolean;
    waiting: boolean;
    editMode: boolean;
    selected: boolean;
    onClick: () => void;
}

const SongRow = memo(({
    song, index, playlistId, isCurrent, isPlaying, waiting, editMode, selected, onClick,
}: SongRowProps) => {
    const { t } = useTranslation();
    const playlists = useStore(s => s.playlists);
    const enqueue = useStore(s => s.enqueue);
    const toggleLike = useStore(s => s.toggleLike);
    const addSongToPlaylist = useStore(s => s.addSongToPlaylist);
    const moveSongToPlaylist = useStore(s => s.moveSongToPlaylist);
    const removeSongs = useStore(s => s.removeSongs);

    const liked = useMemo(
        () => playlists?.find(p => p.id === LIKED_ID)?.songs.some(s => s.id === song.id) ?? false,
        [playlists, song.id],
    );

    const targets = useMemo(
        () => (playlists ?? []).filter(p => p.id !== playlistId && (p.id === LIKED_ID || !isReservedPlaylist(p.id))),
        [playlists, playlistId],
    );

    const items = useMemo<MenuItem[]>(() => {
        const list: MenuItem[] = [
            {
                key: 'play-next',
                label: t('queue.play_next'),
                icon: <IoPlayForwardOutline />,
                onSelect: () => enqueue(song, playlistId, true),
            },
            {
                key: 'queue',
                label: t('queue.add'),
                icon: <IoListOutline />,
                onSelect: () => enqueue(song, playlistId),
            },
            {
                key: 'like',
                label: t(liked ? 'song.unlike' : 'song.like'),
                icon: liked ? <IoHeart /> : <IoHeartOutline />,
                onSelect: () => toggleLike(song),
            },
        ];

        if (targets.length > 0) {
            list.push({
                key: 'add-to',
                label: t('song.add_to_playlist'),
                icon: <IoAddOutline />,
                children: targets.map(target => ({
                    key: `add-${target.id}`,
                    label: target.name,
                    onSelect: () => addSongToPlaylist(song, target.id),
                })),
            });
            if (!isReservedPlaylist(playlistId)) {
                list.push({
                    key: 'move-to',
                    label: t('song.move_to'),
                    icon: <IoArrowForwardOutline />,
                    children: targets.map(target => ({
                        key: `move-${target.id}`,
                        label: target.name,
                        onSelect: () => moveSongToPlaylist(song, playlistId, target.id),
                    })),
                });
            }
        }

        list.push({
            key: 'remove',
            label: t('song.remove'),
            icon: <IoTrashOutline />,
            danger: true,
            onSelect: () => removeSongs(playlistId, [song.id]),
        });

        return list;
    }, [t, liked, targets, song, playlistId, enqueue, toggleLike, addSongToPlaylist, moveSongToPlaylist, removeSongs]);

    const row = (
        <div
            onClick={waiting ? undefined : onClick}
            draggable={!editMode && playlistId !== RADIO_ID}
            onDragStart={(e) => writeSongDrag(e.dataTransfer, { song, fromPlaylistId: playlistId })}
            data-current={isCurrent || undefined}
            data-selected={(editMode && selected) || undefined}
            className={cn(
                'row-tile group grid grid-cols-[30px_1fr_minmax(0,180px)_84px] items-center gap-3 px-3 h-[58px]',
                waiting ? 'opacity-60' : 'cursor-pointer',
            )}
        >
            <div className="flex items-center justify-center text-sm">
                {editMode ? (
                    <span
                        className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors duration-100',
                            selected ? 'bg-ember border-ember' : 'border-ink-4',
                        )}
                    >
                        {selected && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                                <path d="M1.5 5.5L4 8L8.5 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </span>
                ) : waiting && isCurrent ? (
                    <Spinner size={14} className="text-bone-2" />
                ) : isCurrent && isPlaying ? (
                    <div className="flex items-end gap-[2px] h-3.5" aria-hidden>
                        <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                        <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                        <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                    </div>
                ) : (
                    <>
                        <span className={cn('tabular-nums group-hover:hidden', isCurrent ? 'text-brass' : 'text-bone-4')}>
                            {index + 1}
                        </span>
                        <IoPlaySharp size={13} className="hidden group-hover:block text-white" />
                    </>
                )}
            </div>

            <div className="flex items-center gap-3 min-w-0">
                <CoverImage
                    src={song.cover}
                    className="w-10 h-10 rounded-md object-cover shrink-0 border border-ink-3/40"
                    fallbackClassName="rounded-md border border-ink-3/40"
                />
                <p className={cn('text-sm font-medium truncate', isCurrent ? 'text-brass' : 'text-bone-2')}>
                    {song.title}
                </p>
            </div>

            <p className="text-sm text-bone-4 truncate group-hover:text-bone-2 transition-colors duration-100">
                {song.artist}
            </p>

            <div className="flex items-center justify-end gap-2 text-xs text-bone-4 tabular-nums">
                {editMode ? (
                    <IoReorderTwoOutline size={18} />
                ) : (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(song);
                            }}
                            aria-label={t(liked ? 'song.unlike' : 'song.like')}
                            className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                                'transition-[opacity,color,transform] duration-150 ease-out active:scale-90',
                                liked
                                    ? 'text-ember-2 opacity-100'
                                    : 'text-ink-4 opacity-0 group-hover:opacity-100 hover:text-white',
                            )}
                        >
                            {liked ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}
                        </button>
                        <span className="w-9 text-right">
                            {song.duration > 0 ? formatDuration(song.duration) : '-'}
                        </span>
                    </>
                )}
            </div>
        </div>
    );

    return <ContextMenu items={items} disabled={editMode}>{row}</ContextMenu>;
});

SongRow.displayName = 'SongRow';
export default SongRow;
