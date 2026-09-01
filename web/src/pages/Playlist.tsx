import { memo, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Virtuoso } from 'react-virtuoso';
import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import {
    IoPlaySharp, IoAddOutline, IoPencilOutline, IoSearchOutline,
    IoTrashOutline, IoCheckmarkOutline,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { cn, matchesSong } from '@/lib/utils';
import PlaylistCover from '@/components/PlaylistCover';
import SongRow from '@/components/SongRow';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import AddTracksDialog from '@/modals/AddTracksDialog';
import ConfirmDialog from '@/modals/ConfirmDialog';
import type { Song } from '@/types';

const PlaylistPage = () => {
    const { t } = useTranslation();
    const { playlistId } = useParams() as { playlistId: string };

    const playlists = useStore(s => s.playlists);
    const currentSong = useStore(s => s.currentSong);
    const playingPlaylistId = useStore(s => s.playingPlaylistId);
    const playing = useStore(s => s.playing);
    const waiting = useStore(s => s.waiting);
    const editMode = useStore(s => s.editMode);
    const selectedSongs = useStore(s => s.selectedSongs);
    const play = useStore(s => s.play);
    const togglePlay = useStore(s => s.togglePlay);
    const setEditMode = useStore(s => s.setEditMode);
    const setSelectedSongs = useStore(s => s.setSelectedSongs);
    const setPlaylistSongs = useStore(s => s.setPlaylistSongs);
    const removeSongs = useStore(s => s.removeSongs);
    const toast = useStore(s => s.toast);

    const [filter, setFilter] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [clearOpen, setClearOpen] = useState(false);

    const playlist = playlists?.find(p => String(p.id) === playlistId);
    const songs = playlist?.songs ?? [];

    const filtered = useMemo(() => {
        const term = filter.toLowerCase().trim();
        if (!term) return songs;
        return songs.filter(song => matchesSong(song, term));
    }, [songs, filter]);

    if (!playlist) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-sm text-bone-4">{t('playlist.select_playlist')}</p>
            </div>
        );
    }

    const isThisPlaying = playingPlaylistId === playlist.id;

    const handleSongClick = (song: Song) => {
        if (editMode) {
            toggleSelected(song.id);
            return;
        }
        if (currentSong?.id === song.id && isThisPlaying) {
            togglePlay();
            return;
        }
        play(song, playlist.id);
    };

    const toggleSelected = (id: string) => {
        setSelectedSongs(
            selectedSongs.includes(id)
                ? selectedSongs.filter(s => s !== id)
                : [...selectedSongs, id],
        );
    };

    const handlePlayAll = () => {
        if (waiting) return;
        if (isThisPlaying && currentSong) {
            togglePlay();
            return;
        }
        const first = filtered[0];
        if (!first) return;
        play(first, playlist.id);
    };

    const deleteSelected = () => {
        if (selectedSongs.length === 0) {
            toast(t('playlist.not_selected'), 'error');
            return;
        }
        removeSongs(playlist.id, selectedSongs);
        toast(t('playlist.deleted_songs'), 'success');
        setSelectedSongs([]);
        setEditMode(false);
    };

    const clearAll = () => {
        removeSongs(playlist.id, songs.map(s => s.id));
        toast(t('playlist.cleared'), 'success');
        setEditMode(false);
        setClearOpen(false);
    };

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        setPlaylistSongs(playlist.id, arrayMoveImmutable(songs, oldIndex, newIndex));
    };

    const renderRow = (song: Song, index: number) => (
        <SongRow
            song={song}
            index={index}
            playlistId={playlist.id}
            isCurrent={isThisPlaying && currentSong?.id === song.id}
            isPlaying={playing}
            waiting={waiting}
            editMode={editMode}
            selected={selectedSongs.includes(song.id)}
            onClick={() => handleSongClick(song)}
        />
    );

    return (
        <div className="w-full h-full flex flex-col px-7 pt-6">
            <div key={`head-${playlist.id}`} className="fade-up flex items-end gap-5 mb-6 shrink-0">
                <PlaylistCover playlist={playlist} className="w-32 h-32 shadow-lift" rounded="rounded-xl" />
                <div className="min-w-0 flex-1 pb-1 page-title">
                    <p className="field-label mb-2">{t('header.playlist')}</p>
                    <h1 className="text-3xl font-extrabold text-white truncate leading-tight">{playlist.name}</h1>
                    <p className="page-meta truncate mt-1.5">
                        {playlist.description || t('header.songs', { count: songs.length })}
                    </p>
                </div>
            </div>

            <div
                key={`tools-${playlist.id}`}
                className="fade-up flex items-center gap-2.5 mb-4 shrink-0"
                style={{ '--stagger': '50ms' } as React.CSSProperties}
            >
                <button
                    onClick={handlePlayAll}
                    disabled={filtered.length === 0 || waiting || editMode}
                    aria-label={t('general.play')}
                    className={cn(
                        'w-12 h-12 rounded-full bg-primary-glow flex items-center justify-center shrink-0',
                        'transition-transform duration-150 ease-out hover:scale-105 active:scale-95',
                        'disabled:opacity-40 disabled:pointer-events-none',
                    )}
                >
                    {isThisPlaying && playing ? (
                        <span className="flex items-end gap-[2.5px] h-4" aria-hidden>
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-white" />
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-white" />
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-white" />
                        </span>
                    ) : (
                        <IoPlaySharp size={18} className="ml-0.5" />
                    )}
                </button>

                {!editMode ? (
                    <>
                        <Button variant="outline" size="sm" startContent={<IoAddOutline size={16} />} onPress={() => setAddOpen(true)}>
                            {t('search_track.title_short')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            startContent={<IoPencilOutline size={14} />}
                            onPress={() => {
                                setEditMode(true);
                                toast(t('general.edit_enabled'), 'info');
                            }}
                        >
                            {t('playlist.dialog.edit')}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="danger" size="sm" startContent={<IoTrashOutline size={14} />} onPress={() => setClearOpen(true)}>
                            {t('edit.clear')}
                        </Button>
                        <Button variant="outline" size="sm" onPress={deleteSelected}>
                            {t('edit.delete')} ({selectedSongs.length})
                        </Button>
                        <Button variant="primary" size="sm" startContent={<IoCheckmarkOutline size={15} />} onPress={() => setEditMode(false)}>
                            {t('general.done')}
                        </Button>
                    </>
                )}

                <div className="ml-auto w-60">
                    <Input
                        id="playlist-filter"
                        size="sm"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder={t('playlist.search')}
                        startIcon={<IoSearchOutline size={15} />}
                    />
                </div>
            </div>

            {filtered.length > 0 && (
                <div className="grid grid-cols-[30px_1fr_minmax(0,180px)_56px] gap-3 px-3 pb-2 border-b border-ink-3/40 field-label shrink-0">
                    <span className="text-center">#</span>
                    <span>{t('header.title')}</span>
                    <span>{t('header.artist')}</span>
                    <span />
                </div>
            )}

            <div
                key={`list-${playlist.id}`}
                className="fade-up flex-1 min-h-0 pb-4 pt-1"
                style={{ '--stagger': '90ms' } as React.CSSProperties}
            >
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="subtitle mb-2">
                            {filter ? t('playlist.no_results') : t('playlist.no_songs')}
                        </p>
                        <p className="text-xs text-bone-4 mb-5">
                            {filter ? t('playlist.no_song_match') : t('playlist.add_some_songs')}
                        </p>
                        {!filter && (
                            <Button variant="primary" size="sm" startContent={<IoAddOutline size={16} />} onPress={() => setAddOpen(true)}>
                                {t('search_track.title_short')}
                            </Button>
                        )}
                    </div>
                ) : editMode ? (
                    <div className="h-full overflow-y-auto scroll-thin">
                        <SortableList
                            onSortEnd={onSortEnd}
                            draggedItemClassName="dragged"
                            allowDrag={editMode && !filter}
                            className="flex flex-col gap-1"
                        >
                            {filtered.map((song, index) => (
                                <SortableItem key={song.id}>
                                    <div>{renderRow(song, index)}</div>
                                </SortableItem>
                            ))}
                        </SortableList>
                    </div>
                ) : (
                    <Virtuoso
                        data={filtered}
                        className="overflow-x-hidden scroll-thin"
                        itemContent={(index, song) => renderRow(song, index)}
                        style={{ height: '100%' }}
                    />
                )}
            </div>

            <AddTracksDialog open={addOpen} onClose={() => setAddOpen(false)} playlistId={playlist.id} />
            <ConfirmDialog
                open={clearOpen}
                onClose={() => setClearOpen(false)}
                title={t('playlist.confirm.delete_all.title')}
                description={t('playlist.confirm.delete_all.content')}
                onConfirm={clearAll}
            />
        </div>
    );
};

export default memo(PlaylistPage);
