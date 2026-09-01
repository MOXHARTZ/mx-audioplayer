import { memo, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SortableList, { SortableItem } from 'react-easy-sort';
import { arrayMoveImmutable } from 'array-move';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import {
    IoHomeOutline, IoHome, IoSearchOutline, IoSearch, IoRadioOutline, IoRadio,
    IoAddOutline, IoPencilOutline, IoShareSocialOutline, IoTrashOutline,
    IoHeart, IoTimeOutline, IoCopyOutline, IoKeyOutline, IoMusicalNotesOutline,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { LIKED_ID, PINNED_IDS, RECENT_ID, isReservedPlaylist } from '@/lib/reserved';
import { SONG_DRAG_TYPE, readSongDrag } from '@/lib/drag';
import PlaylistCover from './PlaylistCover';
import BrandMark from './BrandMark';
import NowPlayingCard from './NowPlayingCard';
import ContextMenu, { type MenuItem } from './ui/ContextMenu';
import PlaylistDialog from '@/modals/PlaylistDialog';
import ShareDialog from '@/modals/ShareDialog';
import RedeemDialog from '@/modals/RedeemDialog';
import ConfirmDialog from '@/modals/ConfirmDialog';
import type { Playlist } from '@/types';

const NavItem = ({ to, label, icon, activeIcon }: {
    to: string;
    label: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
}) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) => cn(
            'relative flex items-center gap-3 pl-4 pr-3 h-10 rounded-lg text-sm font-semibold select-none',
            'transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98]',
            'before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:rounded-r',
            'before:transition-[background-color,top,bottom] before:duration-150',
            isActive
                ? 'text-white bg-ink-2 before:bg-ember before:top-1 before:bottom-1'
                : 'text-bone-3 before:bg-transparent hover:text-white hover:bg-ink-2/60',
        )}
    >
        {({ isActive }) => (
            <>
                <span className={cn('text-lg', isActive && 'text-ember-2')}>
                    {isActive ? activeIcon : icon}
                </span>
                {label}
            </>
        )}
    </NavLink>
);

const ReservedCover = ({ id }: { id: string | number }) => (
    <span className={cn(
        'w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border',
        id === LIKED_ID
            ? 'bg-ember/20 border-ember/40 text-ember-2'
            : 'bg-ink-2 border-ink-3/50 text-bone-3',
    )}>
        {id === LIKED_ID ? <IoHeart size={18} /> : <IoTimeOutline size={18} />}
    </span>
);

const Sidebar = () => {
    const { t } = useTranslation();
    const allPlaylists = useStore(s => s.playlists) ?? [];
    const stations = useStore(s => s.stations);
    const editMode = useStore(s => s.editMode);
    const playingPlaylistId = useStore(s => s.playingPlaylistId);
    const playing = useStore(s => s.playing);
    const reorderPlaylists = useStore(s => s.reorderPlaylists);
    const deletePlaylist = useStore(s => s.deletePlaylist);
    const duplicatePlaylist = useStore(s => s.duplicatePlaylist);
    const addSongToPlaylist = useStore(s => s.addSongToPlaylist);
    const removeSongs = useStore(s => s.removeSongs);
    const toast = useStore(s => s.toast);

    const [createOpen, setCreateOpen] = useState(false);
    const [redeemOpen, setRedeemOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Playlist | undefined>();
    const [shareTarget, setShareTarget] = useState<Playlist | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<Playlist | undefined>();
    const [dropTarget, setDropTarget] = useState<string | number | null>(null);

    const pinned = useMemo(
        () => PINNED_IDS.map(id => allPlaylists.find(p => p.id === id)).filter(Boolean) as Playlist[],
        [allPlaylists],
    );
    const library = useMemo(
        () => allPlaylists.filter(p => !isReservedPlaylist(p.id)),
        [allPlaylists],
    );

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        const reordered = arrayMoveImmutable(library, oldIndex, newIndex);
        reorderPlaylists([...pinned, ...reordered]);
    };

    const menuFor = (playlist: Playlist): MenuItem[] => {
        if (isReservedPlaylist(playlist.id)) {
            return [{
                key: 'clear',
                label: t('edit.clear'),
                icon: <IoTrashOutline />,
                danger: true,
                onSelect: () => removeSongs(playlist.id, playlist.songs.map(song => song.id)),
            }];
        }
        return [
            { key: 'create', label: t('playlist.context.create'), icon: <IoAddOutline />, onSelect: () => setCreateOpen(true) },
            { key: 'edit', label: t('playlist.dialog.edit'), icon: <IoPencilOutline />, onSelect: () => setEditTarget(playlist) },
            { key: 'duplicate', label: t('song.duplicate'), icon: <IoCopyOutline />, onSelect: () => duplicatePlaylist(playlist) },
            { key: 'share', label: t('playlist.context.share'), icon: <IoShareSocialOutline />, onSelect: () => setShareTarget(playlist) },
            { key: 'delete', label: t('playlist.context.delete'), icon: <IoTrashOutline />, danger: true, onSelect: () => setDeleteTarget(playlist) },
        ];
    };

    const PlaylistRow = ({ playlist, draggableRow }: { playlist: Playlist; draggableRow: boolean }) => {
        const reserved = isReservedPlaylist(playlist.id);
        const acceptsDrop = playlist.id !== RECENT_ID;
        return (
            <ContextMenu items={menuFor(playlist)} disabled={editMode}>
                <NavLink
                    to={`/playlist/${playlist.id}`}
                    onDragOver={(e) => {
                        if (!acceptsDrop || !e.dataTransfer.types.includes(SONG_DRAG_TYPE)) return;
                        e.preventDefault();
                        setDropTarget(playlist.id);
                    }}
                    onDragLeave={() => setDropTarget(current => (current === playlist.id ? null : current))}
                    onDrop={(e) => {
                        setDropTarget(null);
                        if (!acceptsDrop) return;
                        const payload = readSongDrag(e.dataTransfer);
                        if (!payload) return;
                        e.preventDefault();
                        addSongToPlaylist(payload.song, playlist.id);
                    }}
                    className={cn(
                        'row-tile flex items-center gap-3 p-2',
                        draggableRow && editMode && 'pointer-events-none cursor-grab select-none',
                        dropTarget === playlist.id && 'border-ember/60 bg-ember/15',
                    )}
                    data-current={playingPlaylistId === playlist.id || undefined}
                >
                    {reserved
                        ? <ReservedCover id={playlist.id} />
                        : <PlaylistCover playlist={playlist} className="w-11 h-11" rounded="rounded-lg" />}
                    <div className="min-w-0 flex-1">
                        <p className={cn(
                            'text-sm font-semibold truncate',
                            playingPlaylistId === playlist.id ? 'text-brass' : 'text-bone-2',
                        )}>
                            {playlist.name}
                        </p>
                        <p className="text-xs text-bone-4 truncate">
                            {t('header.songs', { count: playlist.songs?.length ?? 0 })}
                        </p>
                    </div>
                    {playingPlaylistId === playlist.id && playing && (
                        <div className="flex items-end gap-[2px] h-3.5 shrink-0 mr-1" aria-hidden>
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                            <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                        </div>
                    )}
                </NavLink>
            </ContextMenu>
        );
    };

    return (
        <aside className="h-full w-[276px] shrink-0 flex flex-col border-r border-ink-3/70 bg-ink-1">
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <BrandMark size={34} />
                <div className="min-w-0 leading-none">
                    <p className="text-[13px] font-extrabold tracking-[0.16em] text-white">MX</p>
                    <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-bone-4">
                        AUDIOPLAYER
                    </p>
                </div>
            </div>

            <nav className="px-3 pt-1 flex flex-col gap-1">
                <NavItem to="/" label={t('nav.home')} icon={<IoHomeOutline />} activeIcon={<IoHome />} />
                <NavItem to="/search" label={t('nav.search')} icon={<IoSearchOutline />} activeIcon={<IoSearch />} />
                {stations.length > 0 && (
                    <NavItem to="/radio" label={t('station.title')} icon={<IoRadioOutline />} activeIcon={<IoRadio />} />
                )}
            </nav>

            {pinned.length > 0 && (
                <div className="mt-4 px-2 flex flex-col gap-1">
                    {pinned.map(playlist => (
                        <PlaylistRow key={playlist.id} playlist={playlist} draggableRow={false} />
                    ))}
                </div>
            )}

            <div className="mt-4 mx-3 pt-3 pb-2 flex items-center justify-between border-t border-ink-3/40">
                <span className="field-label">{t('nav.library')}</span>
                <Dropdown
                    placement="bottom-end"
                    classNames={{ content: 'bg-ink-1 border border-ink-3/60 rounded-xl shadow-lift min-w-[12rem]' }}
                >
                    <DropdownTrigger>
                        <button
                            className="w-7 h-7 rounded-md flex items-center justify-center text-bone-3 hover:text-white hover:bg-ink-3/50 transition-colors duration-150 active:scale-95"
                            aria-label={t('playlist.context.create')}
                        >
                            <IoAddOutline size={18} />
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={t('nav.library')} variant="flat">
                        <DropdownItem
                            key="create"
                            className="text-bone-2 data-[hover=true]:text-white"
                            startContent={<IoMusicalNotesOutline />}
                            onPress={() => setCreateOpen(true)}
                        >
                            {t('playlist.context.create')}
                        </DropdownItem>
                        <DropdownItem
                            key="redeem"
                            className="text-bone-2 data-[hover=true]:text-white"
                            startContent={<IoKeyOutline />}
                            onPress={() => setRedeemOpen(true)}
                        >
                            {t('share.redeem_title')}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

            <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-3">
                <SortableList
                    onSortEnd={onSortEnd}
                    className="flex flex-col gap-1"
                    draggedItemClassName="dragged"
                    allowDrag={editMode}
                >
                    {library.map((playlist, index) => (
                        <SortableItem key={playlist.id}>
                            <div
                                className="fade-up"
                                style={{ '--stagger': `${Math.min(index * 35, 280)}ms` } as React.CSSProperties}
                            >
                                <PlaylistRow playlist={playlist} draggableRow />
                            </div>
                        </SortableItem>
                    ))}
                </SortableList>
                {library.length === 0 && (
                    <p className="text-bone-4 text-xs px-3 pt-1 leading-relaxed">{t('nav.no_playlists')}</p>
                )}
            </div>

            <NowPlayingCard />

            <PlaylistDialog open={createOpen} onClose={() => setCreateOpen(false)} />
            <PlaylistDialog
                open={!!editTarget}
                onClose={() => setEditTarget(undefined)}
                playlist={editTarget}
            />
            <ShareDialog
                open={!!shareTarget}
                onClose={() => setShareTarget(undefined)}
                playlist={shareTarget}
            />
            <RedeemDialog open={redeemOpen} onClose={() => setRedeemOpen(false)} />
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(undefined)}
                title={t('playlist.context.delete')}
                description={deleteTarget?.name}
                onConfirm={() => {
                    if (!deleteTarget) return;
                    deletePlaylist(deleteTarget.id);
                    toast(t('playlist.deleted'), 'success');
                    setDeleteTarget(undefined);
                }}
            />
        </aside>
    );
};

export default memo(Sidebar);
