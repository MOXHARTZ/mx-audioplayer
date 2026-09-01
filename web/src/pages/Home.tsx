import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoPlaySharp, IoAddOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import PlaylistCover from '@/components/PlaylistCover';
import Button from '@/components/ui/Button';
import PlaylistDialog from '@/modals/PlaylistDialog';

const Home = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const playlists = useStore(s => s.playlists) ?? [];
    const play = useStore(s => s.play);
    const waiting = useStore(s => s.waiting);
    const [createOpen, setCreateOpen] = useState(false);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return t('header.good_morning');
        if (hour >= 12 && hour < 18) return t('header.good_afternoon');
        return t('header.good_evening');
    }, [t]);

    const totalSongs = playlists.reduce((sum, playlist) => sum + (playlist.songs?.length ?? 0), 0);

    return (
        <div className="w-full h-full overflow-y-auto scroll-thin px-7 py-6">
            <div className="flex items-end justify-between gap-4 mb-7 pr-[var(--chrome-gutter)]">
                <div className="min-w-0 page-title">
                    <h1 className="white-title truncate">{greeting}</h1>
                    <p className="page-meta mt-1.5 flex items-center flex-wrap">
                        <span>{t('header.jump_back_into_your_music')}</span>
                        {playlists.length > 0 && (
                            <>
                                <span className="font-mono tabular-nums text-bone-2">
                                    {playlists.length}
                                    <span className="ml-1.5 font-sans text-bone-4">{t('nav.library')}</span>
                                </span>
                                <span className="font-mono tabular-nums text-bone-2">
                                    {totalSongs}
                                    <span className="ml-1.5 font-sans text-bone-4">{t('playlist.songs')}</span>
                                </span>
                            </>
                        )}
                    </p>
                </div>
                {playlists.length > 0 && (
                    <Button
                        variant="primary"
                        size="md"
                        className="shrink-0"
                        startContent={<IoAddOutline size={18} />}
                        onPress={() => setCreateOpen(true)}
                    >
                        {t('playlist.context.create')}
                    </Button>
                )}
            </div>

            {playlists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    {playlists.map((playlist, index) => (
                        <button
                            key={playlist.id}
                            style={{ '--stagger': `${Math.min(index * 40, 300)}ms` } as React.CSSProperties}
                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                            className="fade-up card-tile group p-3 text-left"
                        >
                            <div className="relative mb-3">
                                <PlaylistCover playlist={playlist} className="w-full aspect-square" rounded="rounded-lg" />
                                {playlist.songs.length > 0 && (
                                    <span
                                        role="button"
                                        aria-label={t('general.play')}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (waiting) return;
                                            play(playlist.songs[0], playlist.id);
                                        }}
                                        className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-primary-glow
                                            flex items-center justify-center
                                            opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                                            transition-[opacity,transform] duration-200 ease-out
                                            hover:scale-105 active:scale-95"
                                    >
                                        <IoPlaySharp size={17} className="ml-0.5" />
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
                            <p className="text-xs text-bone-4 truncate mt-0.5">
                                {playlist.description || t('header.songs', { count: playlist.songs?.length ?? 0 })}
                            </p>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <h2 className="subtitle mb-2">{t('header.create_your_first_playlist')}</h2>
                    <p className="text-sm text-bone-4 mb-6">{t('header.it_s_easy_we_ll_help_you')}</p>
                    <Button variant="primary" startContent={<IoAddOutline size={18} />} onPress={() => setCreateOpen(true)}>
                        {t('playlist.context.create')}
                    </Button>
                </div>
            )}

            <PlaylistDialog open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
};

export default memo(Home);
