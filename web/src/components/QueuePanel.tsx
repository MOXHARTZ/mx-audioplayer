import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import { IoCloseOutline, IoRepeatSharp, IoTrashOutline, IoReorderTwoOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';
import { SONG_DRAG_TYPE, readSongDrag } from '@/lib/drag';
import CoverImage from './CoverImage';
import ScrollingText from './ScrollingText';

const Row = ({ song, meta, onRemove }: {
    song: { title: string; artist: string; cover: string; duration: number };
    meta?: string;
    onRemove?: () => void;
}) => (
    <div className="row-tile group flex items-center gap-3 px-2.5 h-14">
        <CoverImage
            src={song.cover}
            className="w-9 h-9 rounded-md object-cover shrink-0 border border-ink-3/40"
            fallbackClassName="rounded-md border border-ink-3/40"
        />
        <div className="min-w-0 flex-1">
            <ScrollingText className="text-sm font-medium text-bone-2">{song.title}</ScrollingText>
            <p className="text-xs text-bone-4 truncate">{meta ?? song.artist}</p>
        </div>
        {onRemove ? (
            <button
                onClick={onRemove}
                aria-label="remove"
                className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 opacity-0 group-hover:opacity-100
                    hover:text-white hover:bg-ink-3/60 transition-[opacity,color,background-color] duration-150 active:scale-95 shrink-0"
            >
                <IoCloseOutline size={16} />
            </button>
        ) : (
            <span className="text-xs text-bone-4 tabular-nums shrink-0">
                {song.duration > 0 ? formatDuration(song.duration) : '-'}
            </span>
        )}
    </div>
);

const QueuePanel = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const open = useStore(s => s.queueOpen);
    const setQueueOpen = useStore(s => s.setQueueOpen);
    const queue = useStore(s => s.queue);
    const currentSong = useStore(s => s.currentSong);
    const playingPlaylistId = useStore(s => s.playingPlaylistId);
    const playlists = useStore(s => s.playlists);
    const repeat = useStore(s => s.repeat);
    const dequeue = useStore(s => s.dequeue);
    const moveQueue = useStore(s => s.moveQueue);
    const clearQueue = useStore(s => s.clearQueue);
    const enqueue = useStore(s => s.enqueue);

    const [dropActive, setDropActive] = useState(false);

    const playing = playlists?.find(p => p.id === playingPlaylistId);

    const upNext = useMemo(() => {
        if (!playing || !currentSong) return [];
        const index = playing.songs.findIndex(song => song.id === currentSong.id);
        if (index < 0) return playing.songs.slice(0, 5);
        return [...playing.songs.slice(index + 1), ...playing.songs.slice(0, index)].slice(0, 5);
    }, [playing, currentSong]);

    return (
        <AnimatePresence>
            {open && (
                <motion.aside
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    onDragOver={(e) => {
                        if (!e.dataTransfer.types.includes(SONG_DRAG_TYPE)) return;
                        e.preventDefault();
                        setDropActive(true);
                    }}
                    onDragLeave={() => setDropActive(false)}
                    onDrop={(e) => {
                        setDropActive(false);
                        const payload = readSongDrag(e.dataTransfer);
                        if (!payload) return;
                        e.preventDefault();
                        enqueue(payload.song, payload.fromPlaylistId);
                    }}
                    className={cn(
                        'w-[320px] shrink-0 border-l border-ink-3/40 flex flex-col min-h-0',
                        dropActive && 'bg-ember/10',
                    )}
                >
                    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-ink-3/40">
                        <span className="field-label">{t('queue.title')}</span>
                        <div className="flex items-center gap-1">
                            {queue.length > 0 && (
                                <button
                                    onClick={clearQueue}
                                    aria-label={t('queue.clear')}
                                    title={t('queue.clear')}
                                    className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 hover:text-white hover:bg-ink-3/60 transition-colors duration-150 active:scale-95"
                                >
                                    <IoTrashOutline size={15} />
                                </button>
                            )}
                            <button
                                onClick={() => setQueueOpen(false)}
                                aria-label="close"
                                className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 hover:text-white hover:bg-ink-3/60 transition-colors duration-150 active:scale-95"
                            >
                                <IoCloseOutline size={18} />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 min-h-0 overflow-y-auto scroll-thin px-2 py-3 flex flex-col gap-5">
                        {currentSong && (
                            <section>
                                <p className="field-label px-1.5 mb-2">{t('queue.now_playing')}</p>
                                <div data-current="true" className="rounded-lg">
                                    <Row song={currentSong} />
                                </div>
                            </section>
                        )}

                        {repeat && (
                            <p className="mx-1.5 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[11px] leading-relaxed text-bone-2">
                                {t('queue.repeat_on')}
                            </p>
                        )}

                        <section>
                            <p className="field-label px-1.5 mb-2">{t('queue.next_up')}</p>
                            {queue.length === 0 ? (
                                <div className="px-1.5 py-6 text-center">
                                    <p className="text-sm font-semibold text-bone-3">{t('queue.empty')}</p>
                                    <p className="text-xs text-bone-4 mt-1.5 leading-relaxed">{t('queue.empty_hint')}</p>
                                </div>
                            ) : (
                                <SortableList
                                    onSortEnd={(oldIndex, newIndex) => {
                                        const entry = arrayMoveImmutable(queue, oldIndex, newIndex)[newIndex];
                                        moveQueue(entry.uid, newIndex);
                                    }}
                                    draggedItemClassName="dragged"
                                    className="flex flex-col gap-0.5"
                                >
                                    {queue.map(entry => (
                                        <SortableItem key={entry.uid}>
                                            <div className="flex items-center gap-1">
                                                <IoReorderTwoOutline size={16} className="text-ink-4 shrink-0 cursor-grab" />
                                                <div className="flex-1 min-w-0">
                                                    <Row song={entry.song} onRemove={() => dequeue(entry.uid)} />
                                                </div>
                                            </div>
                                        </SortableItem>
                                    ))}
                                </SortableList>
                            )}
                        </section>

                        {upNext.length > 0 && (
                            <section>
                                <p className="field-label px-1.5 mb-2">
                                    {t('queue.next_from', { name: playing?.name ?? '' })}
                                </p>
                                <div className="flex flex-col gap-0.5 opacity-70">
                                    {upNext.map(song => (
                                        <Row key={song.id} song={song} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {repeat && (
                        <div className="shrink-0 border-t border-ink-3/40 px-4 py-2 flex items-center gap-2 text-[11px] text-brass">
                            <IoRepeatSharp size={14} />
                            {t('queue.title')}
                        </div>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
};

export default memo(QueuePanel);
