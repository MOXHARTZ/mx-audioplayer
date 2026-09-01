import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IoHeart, IoHeartOutline, IoMusicalNotesOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { LIKED_ID } from '@/lib/reserved';
import CoverImage from './CoverImage';
import ScrollingText from './ScrollingText';

const NowPlayingCard = () => {
    const { t } = useTranslation();
    const currentSong = useStore(s => s.currentSong);
    const playingPlaylistId = useStore(s => s.playingPlaylistId);
    const playlists = useStore(s => s.playlists);
    const toggleLike = useStore(s => s.toggleLike);

    const playlistName = playlists?.find(p => p.id === playingPlaylistId)?.name;
    const liked = !!currentSong
        && (playlists?.find(p => p.id === LIKED_ID)?.songs.some(s => s.id === currentSong.id) ?? false);

    if (!currentSong) {
        return (
            <div className="shrink-0 border-t border-ink-3/40 px-3 py-4">
                <div className="flex items-center gap-3 rounded-card border border-dashed border-ink-3/60 px-3 py-3">
                    <span className="w-9 h-9 rounded-lg bg-ink-2 border border-ink-3/50 flex items-center justify-center text-ink-4 shrink-0">
                        <IoMusicalNotesOutline size={16} />
                    </span>
                    <p className="text-[11px] leading-snug text-bone-4">{t('playlist.ready_to_play')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shrink-0 border-t border-ink-3/40 px-3 pt-3 pb-4">
            <div key={currentSong.id} className="fade-soft">
                <CoverImage
                    src={currentSong.cover}
                    alt={currentSong.title}
                    className="w-full aspect-square rounded-card object-cover border border-ink-3/50"
                    fallbackClassName="rounded-card border border-ink-3/50"
                />

                <div className="mt-3 flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <ScrollingText className="text-sm font-semibold text-white">
                            {currentSong.title}
                        </ScrollingText>
                        <ScrollingText className="mt-0.5 text-xs text-bone-4">
                            {currentSong.artist}
                        </ScrollingText>
                        {playlistName && (
                            <p className="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-bone-4">
                                {playlistName}
                            </p>
                        )}
                    </div>

                    {!currentSong.isStream && (
                        <button
                            onClick={() => toggleLike(currentSong)}
                            aria-label={t(liked ? 'song.unlike' : 'song.like')}
                            className={cn(
                                'w-8 h-8 shrink-0 rounded-lg flex items-center justify-center',
                                'transition-[color,transform] duration-150 ease-out active:scale-90',
                                liked ? 'text-ember-2' : 'text-ink-4 hover:text-white',
                            )}
                        >
                            {liked ? <IoHeart size={17} /> : <IoHeartOutline size={17} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default memo(NowPlayingCard);
