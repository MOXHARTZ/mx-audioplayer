import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSearchOutline, IoAddOutline, IoCheckmarkOutline, IoMusicalNotesOutline, IoLogoYoutube } from 'react-icons/io5';
import { FaSpotify } from 'react-icons/fa';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import { getYoutubePlaylistID, isSpotifyAlbum, isSpotifyPlaylist, isUrl, nanoid, YOUTUBE_URL, cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import CoverImage from '@/components/CoverImage';
import type { QueryResult, Song, Track } from '@/types';

interface AddTracksDialogProps {
    open: boolean;
    onClose: () => void;
    playlistId: string | number;
}

const MOCK_TRACKS: Track[] = Array.from({ length: 5 }, (_, i) => ({
    id: String(i),
    name: `Track ${i + 1}`,
    artists: [{ name: 'Artist' }],
    thumbnails: [{ url: `https://picsum.photos/seed/track-${i}/90/90` }],
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
}));

const trackToSong = (track: Track): Song => ({
    id: nanoid(),
    soundId: nanoid(),
    title: track.name ?? 'Unknown',
    artist: track.artist?.name ?? track.artists?.[0]?.name ?? 'Unknown',
    cover: track.thumbnails[track.thumbnails.length - 1]?.url ?? '',
    url: track.url ?? track.videoId,
    duration: 0,
});

const SkeletonRow = () => (
    <div className="flex items-center gap-3 p-2.5 rounded-lg animate-pulse">
        <div className="w-11 h-11 rounded-md bg-ink-2" />
        <div className="flex-1 space-y-2">
            <div className="h-3 w-2/5 rounded bg-ink-2" />
            <div className="h-2.5 w-1/4 rounded bg-ink-2" />
        </div>
    </div>
);

const AddTracksDialog = ({ open, onClose, playlistId }: AddTracksDialogProps) => {
    const { t } = useTranslation();
    const playlists = useStore(s => s.playlists);
    const setPlaylistSongs = useStore(s => s.setPlaylistSongs);
    const toast = useStore(s => s.toast);

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Track[]>([]);
    const [addedIds, setAddedIds] = useState<string[]>([]);

    const currentSongs = playlists?.find(p => p.id === playlistId)?.songs ?? [];

    const close = () => {
        setQuery('');
        setResults([]);
        setAddedIds([]);
        onClose();
    };

    const search = useCallback(async () => {
        const trimmed = query.trim();
        if (!trimmed || loading) return;
        setLoading(true);
        setAddedIds([]);
        try {
            const normalized = trimmed.replace(/\s/g, '%20').replace(/\/intl-[a-z]{2}\//, '/');
            const isTrackList = getYoutubePlaylistID(normalized) || isSpotifyPlaylist(normalized) || isSpotifyAlbum(normalized);

            if (isUrl(normalized) && !isTrackList) {
                const info = await fetchNui<{ title: string; artist: string; thumbnail: string; videoId?: string; url?: string } | null>(
                    'getSoundData', { url: normalized }, { title: 'Mock Track', artist: 'Mock', thumbnail: 'https://picsum.photos/seed/url/90/90' },
                );
                if (!info) {
                    toast(t('search_track.invalid_url'), 'error');
                    setResults([]);
                    return;
                }
                setResults([{
                    id: nanoid(),
                    name: info.title,
                    artists: [{ name: info.artist }],
                    thumbnails: [{ url: info.thumbnail }],
                    url: info.url ?? normalized,
                }]);
                return;
            }

            const endpoint = isTrackList ? 'searchTracks' : 'searchQuery';
            const result = await fetchNui<QueryResult>(endpoint, { query: normalized }, MOCK_TRACKS);
            if (!result) {
                setResults([]);
                return;
            }
            if (!Array.isArray(result)) {
                toast(result.error, 'error');
                return;
            }
            setResults(result.map(track => ({
                ...track,
                id: nanoid(),
                url: track.url ?? (track.videoId ? `${YOUTUBE_URL}${track.videoId}` : undefined),
            })));
        } finally {
            setLoading(false);
        }
    }, [query, loading, t, toast]);

    const addTrack = (track: Track) => {
        if (addedIds.includes(track.id)) return;
        setPlaylistSongs(playlistId, [...(playlists?.find(p => p.id === playlistId)?.songs ?? []), trackToSong(track)]);
        setAddedIds(ids => [...ids, track.id]);
    };

    const addAll = () => {
        const remaining = results.filter(track => !addedIds.includes(track.id));
        if (remaining.length === 0) return;
        setPlaylistSongs(playlistId, [...currentSongs, ...remaining.map(trackToSong)]);
        toast(t('search_track.added', { count: remaining.length }), 'success');
        close();
    };

    return (
        <Modal
            open={open}
            onClose={close}
            title={t('search_track.title')}
            description={t('search_track.subtitle')}
            size="lg"
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-xs text-bone-4">
                    <span className="flex items-center gap-1.5">
                        <FaSpotify className="text-emerald-400" size={14} /> Spotify
                    </span>
                    <span className="flex items-center gap-1.5">
                        <IoLogoYoutube className="text-red-400" size={14} /> YouTube
                    </span>
                    <span className="flex items-center gap-1.5">
                        <IoMusicalNotesOutline size={14} /> {t('search_track.by_name')}
                    </span>
                </div>

                <div className="flex gap-2 items-center">
                    <Input
                        autoFocus
                        id="track-search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && search()}
                        placeholder={t('search_track.placeholder')}
                        startIcon={<IoSearchOutline size={16} />}
                        isDisabled={loading}
                    />
                    <Button variant="primary" onPress={search} loading={loading} className="shrink-0">
                        {t('nav.search')}
                    </Button>
                </div>

                <div className="max-h-80 overflow-y-auto scroll-thin -mx-2 px-2">
                    {loading ? (
                        <>
                            <SkeletonRow />
                            <SkeletonRow />
                            <SkeletonRow />
                        </>
                    ) : (
                        results.map(track => {
                            const added = addedIds.includes(track.id);
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => addTrack(track)}
                                    disabled={added}
                                    className={cn(
                                        'row-tile w-full flex items-center gap-3 p-2.5 text-left',
                                        added && 'opacity-60',
                                    )}
                                >
                                    <CoverImage
                                        src={track.thumbnails[track.thumbnails.length - 1]?.url}
                                        className="w-11 h-11 rounded-md object-cover shrink-0 border border-ink-3/40"
                                        fallbackClassName="rounded-md border border-ink-3/40"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{track.name}</p>
                                        <p className="text-xs text-bone-4 truncate">
                                            {track.artist?.name ?? track.artists?.[0]?.name ?? t('general.unknown')}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors duration-100',
                                        added ? 'text-emerald-400' : 'text-bone-3 hover:text-white hover:bg-ink-3/60',
                                    )}>
                                        {added ? <IoCheckmarkOutline size={16} /> : <IoAddOutline size={16} />}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>

                {results.length > 1 && !loading && (
                    <Button variant="primary" fullWidth onPress={addAll}>
                        {t('search_track.add_all')}
                    </Button>
                )}
            </div>
        </Modal>
    );
};

export default AddTracksDialog;
