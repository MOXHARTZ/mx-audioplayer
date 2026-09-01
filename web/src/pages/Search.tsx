import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoSearchOutline, IoPlaySharp } from 'react-icons/io5';
import { useStore } from '@/store';
import { includesFold, matchesSong } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import PlaylistCover from '@/components/PlaylistCover';
import CoverImage from '@/components/CoverImage';
import type { Song } from '@/types';

type SongHit = Song & { playlistId: string | number; playlistName: string };

const Search = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const playlists = useStore(s => s.playlists) ?? [];
    const play = useStore(s => s.play);
    const waiting = useStore(s => s.waiting);
    const [query, setQuery] = useState('');

    const trimmed = query.toLowerCase().trim();

    const songHits = useMemo<SongHit[]>(() => {
        if (!trimmed) return [];
        const hits: SongHit[] = [];
        for (const playlist of playlists) {
            for (const song of playlist.songs ?? []) {
                if (matchesSong(song, trimmed)) {
                    hits.push({ ...song, playlistId: playlist.id, playlistName: playlist.name });
                }
            }
        }
        return hits.slice(0, 50);
    }, [playlists, trimmed]);

    const playlistHits = useMemo(() => {
        if (!trimmed) return [];
        return playlists.filter(p =>
            includesFold(p.name, trimmed) || includesFold(p.description, trimmed)
        );
    }, [playlists, trimmed]);

    return (
        <div className="w-full h-full overflow-y-auto scroll-thin px-7 py-6">
            <div className="max-w-lg mb-7">
                <Input
                    autoFocus
                    id="library-search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    startIcon={<IoSearchOutline size={16} />}
                />
            </div>

            {!trimmed ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <IoSearchOutline size={40} className="text-ink-4 mb-4" />
                    <p className="text-sm text-bone-4">{t('search.hint')}</p>
                </div>
            ) : playlistHits.length === 0 && songHits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <p className="subtitle mb-2">{t('search.no_results')}</p>
                    <p className="text-sm text-bone-4">{t('search.try_different')}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {playlistHits.length > 0 && (
                        <section className="fade-soft">
                            <h2 className="field-label mb-3">{t('header.your_playlists')}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
                                {playlistHits.map(playlist => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                                        className="card-tile p-3 text-left"
                                    >
                                        <PlaylistCover playlist={playlist} className="w-full aspect-square mb-2.5" rounded="rounded-lg" />
                                        <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
                                        <p className="text-xs text-bone-4 truncate mt-0.5">
                                            {t('header.songs', { count: playlist.songs?.length ?? 0 })}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {songHits.length > 0 && (
                        <section className="fade-soft">
                            <h2 className="field-label mb-3">{t('playlist.songs')}</h2>
                            <div className="flex flex-col gap-1">
                                {songHits.map(song => (
                                    <button
                                        key={`${song.playlistId}-${song.id}`}
                                        disabled={waiting}
                                        onClick={() => play(song, song.playlistId)}
                                        className="row-tile group grid grid-cols-[40px_1fr_minmax(0,200px)] items-center gap-3 px-3 h-[58px] text-left disabled:opacity-50"
                                    >
                                        <div className="relative w-10 h-10">
                                            <CoverImage
                                                src={song.cover}
                                                className="w-10 h-10 rounded-md object-cover border border-ink-3/40"
                                                fallbackClassName="rounded-md border border-ink-3/40"
                                            />
                                            <span className="absolute inset-0 rounded-md bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex items-center justify-center">
                                                <IoPlaySharp size={14} className="text-white" />
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{song.title}</p>
                                            <p className="text-xs text-bone-4 truncate">{song.artist}</p>
                                        </div>
                                        <p className="text-xs text-bone-4 truncate text-right">{song.playlistName}</p>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default memo(Search);
