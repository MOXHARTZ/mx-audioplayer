import Menu from '@mui/material/Menu';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { MdAudiotrack, MdEdit } from 'react-icons/md';
import { IoPerson, IoTrash } from 'react-icons/io5';
import { Playlist } from '@/fake-api/playlist-categories';
import { useCallback, useState } from 'react';
import PlaylistDialog from './playlist-dialog';
import { useAppDispatch } from '@/stores';
import { deletePlaylist } from '@/stores/Main';
import { toast } from 'react-toastify';
import { Divider } from '@mui/material';
import i18next from 'i18next';
import Share from './share';

export default function ContextMenu({ children, disabled, playlist }: { children?: React.ReactNode, disabled?: boolean, playlist?: Playlist }) {
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState<boolean>(false);
    const [showEditPlaylist, setShowEditPlaylist] = useState<boolean>(false)
    const [showShare, setShowShare] = useState<boolean>(false)
    const dispatch = useAppDispatch();
    const [clickedDelete, setClickedDelete] = useState<boolean>(false)

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        if (disabled) return;
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                :
                null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleDelete = useCallback(() => {
        if (!clickedDelete) {
            setClickedDelete(true)
            return toast.info(i18next.t('general.delete.confirm'))
        }
        if (!playlist) return toast.error('Playlist not found');
        dispatch(deletePlaylist(playlist?.id ?? 0))
        toast.success('Playlist deleted')
        handleClose()
    }, [playlist, clickedDelete])

    return (
        <div onContextMenu={handleContextMenu} className='w-full h-full' style={{ cursor: 'context-menu' }}>
            {children}
            <Menu
                open={contextMenu !== null && !showEditPlaylist && !showCreatePlaylist && !showShare}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <div>
                    <MenuItem onClick={() => setShowCreatePlaylist(true)}>
                        <ListItemIcon>
                            <MdAudiotrack />
                        </ListItemIcon>
                        <ListItemText>{i18next.t('playlist.context.create')}</ListItemText>
                    </MenuItem>
                    {playlist ? (
                        <>
                            <MenuItem onClick={() => setShowEditPlaylist(true)}>
                                <ListItemIcon>
                                    <MdEdit />
                                </ListItemIcon>
                                <ListItemText>{i18next.t('playlist.dialog.edit')}</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => setShowShare(true)}>
                                <ListItemIcon>
                                    <IoPerson />
                                </ListItemIcon>
                                <ListItemText>{i18next.t('playlist.context.share')}</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleDelete}>
                                <ListItemIcon>
                                    <IoTrash />
                                </ListItemIcon>
                                <ListItemText>{i18next.t('playlist.context.delete')}</ListItemText>
                            </MenuItem>
                        </>
                    ) : null}
                </div>
            </Menu>
            {showCreatePlaylist && <PlaylistDialog open={showCreatePlaylist} setOpen={setShowCreatePlaylist} />}
            {showEditPlaylist && <PlaylistDialog open={showEditPlaylist} setOpen={setShowEditPlaylist} currentPlaylist={playlist} />}
            {showShare && <Share open={showShare} setOpen={setShowShare} currentPlaylist={playlist} />}
        </div>
    );
}