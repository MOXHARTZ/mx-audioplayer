import { MdAudiotrack, MdEdit } from 'react-icons/md';
import { IoPerson } from 'react-icons/io5';
import { Playlist } from '@/fake-api/playlist-categories';
import { useCallback, useRef, useState } from 'react';
import PlaylistDialog from './playlist-dialog';
import { useAppDispatch } from '@/stores';
import { deletePlaylist } from '@/stores/Main';
import { toast } from 'react-toastify';
import i18next from 'i18next';
import Share from './share';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn, DropdownSection } from "@nextui-org/react";
import { IoMdTrash } from "react-icons/io";

const iconClasses = "text-xl text-default-500 pointer-events-none flex-shrink-0";

export default function ContextMenu({ children, disabled, playlist }: { children?: React.ReactNode, disabled?: boolean, playlist?: Playlist }) {
    const [showCreatePlaylist, setShowCreatePlaylist] = useState<boolean>(false);
    const [showEditPlaylist, setShowEditPlaylist] = useState<boolean>(false)
    const [showShare, setShowShare] = useState<boolean>(false)
    const dispatch = useAppDispatch();
    const [clickedDelete, setClickedDelete] = useState<boolean>(false)
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        if (disabled) return;
        if (!btnRef?.current) return;
        const target = event.target as HTMLElement;
        const offsetLeft = target.offsetLeft;
        const offsetTop = target.offsetTop;
        btnRef.current.style.top = `${offsetTop}px`;
        btnRef.current.style.left = `${offsetLeft}px`;
        btnRef.current.click();
    };

    const handleDelete = useCallback(() => {
        if (!clickedDelete) {
            setClickedDelete(true)
            return toast.info(i18next.t('general.delete.confirm'))
        }
        if (!playlist) return toast.error('Playlist not found');
        dispatch(deletePlaylist(playlist?.id ?? 0))
        toast.success('Playlist deleted')
    }, [playlist, clickedDelete])

    return (
        <div className='w-full h-full' onContextMenu={handleContextMenu}>
            {children}
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        ref={btnRef}
                        className='invisible absolute inset-0'
                        variant="bordered"
                    >
                        Open Menu
                    </Button>
                </DropdownTrigger>
                <DropdownMenu variant="faded" aria-label="Dropdown menu with icons">
                    <DropdownSection title={i18next.t('playlist.context.actions')} showDivider>
                        <DropdownItem
                            key="create"
                            startContent={<MdAudiotrack className={iconClasses} />}
                            onPress={() => setShowCreatePlaylist(true)}
                        >
                            {i18next.t('playlist.context.create')}
                        </DropdownItem>
                        <DropdownItem
                            key="edit"
                            startContent={<MdEdit className={iconClasses} />}
                            onPress={() => setShowEditPlaylist(true)}
                        >
                            {i18next.t('playlist.dialog.edit')}
                        </DropdownItem>
                        <DropdownItem
                            key="share"
                            startContent={<IoPerson className={iconClasses} />}
                            onPress={() => setShowShare(true)}
                        >
                            {i18next.t('playlist.context.share')}
                        </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title={i18next.t('playlist.context.danger')}>
                        <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<IoMdTrash className={cn(iconClasses, "text-danger")} />}
                            onPress={handleDelete}
                        >
                            {i18next.t('playlist.context.delete')}
                        </DropdownItem>
                    </DropdownSection>
                </DropdownMenu>
            </Dropdown>
            {showCreatePlaylist && <PlaylistDialog open={showCreatePlaylist} setOpen={setShowCreatePlaylist} />}
            {showEditPlaylist && <PlaylistDialog open={showEditPlaylist} setOpen={setShowEditPlaylist} currentPlaylist={playlist} />}
            {showShare && <Share open={showShare} setOpen={setShowShare} currentPlaylist={playlist} />}
        </div>
    );
}