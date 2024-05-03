import i18next from 'i18next'
import { useCallback, useState } from 'react';
import PlaylistImage from '../PlaylistImage';
import { Playlist } from '@/fake-api/playlist-categories';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/stores';
import { addPlaylist, updatePlaylist } from '@/stores/Main';
import { nanoid } from '@reduxjs/toolkit';
import { isEmpty } from '@/utils/misc';
import classNames from 'classnames';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Input } from "@nextui-org/react";

const PlaylistDialog = ({ open, setOpen, currentPlaylist }: { open: boolean, setOpen: (open: boolean) => void, currentPlaylist?: Playlist }) => {
    const dispatch = useAppDispatch()
    const [name, setName] = useState(currentPlaylist?.name ?? '')
    const [description, setDescription] = useState(currentPlaylist?.description ?? '')
    const [image, setImage] = useState(currentPlaylist?.thumbnail ?? '')
    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);
    const handleFinish = useCallback(() => {
        setOpen(false);
        if (currentPlaylist) {
            dispatch(updatePlaylist({
                id: currentPlaylist.id,
                name,
                description,
                thumbnail: isEmpty(image) ? undefined : image,
                songs: currentPlaylist.songs
            }))
            return;
        }
        toast.success(i18next.t('playlist.dialog.created'))
        dispatch(addPlaylist({
            id: nanoid(),
            name,
            description,
            thumbnail: isEmpty(image) ? undefined : image,
            songs: []
        }))
    }, [name, description, image]);
    return (
        <Modal size='xl' isOpen={open} onClose={handleClose}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{currentPlaylist ? i18next.t('playlist.dialog.edit') : i18next.t('playlist.dialog.create')}</ModalHeader>
                        <ModalBody className='grid grid-cols-2 gap-2 mb-5'>
                            <PlaylistImage
                                playlist={currentPlaylist}
                                className={classNames({
                                    'bg-zinc-500': isEmpty(image),
                                    'rounded-md flex items-center justify-center': !currentPlaylist || isEmpty(currentPlaylist.thumbnail)
                                })}
                                url={image}
                            />
                            <aside className='space-y-2'>
                                <Input
                                    autoFocus
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    label={i18next.t('playlist.dialog.name')}
                                    type="text"
                                    fullWidth
                                    variant='flat'
                                    autoComplete='off'
                                    required
                                />
                                <Input
                                    autoFocus
                                    id="image-url"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    label={i18next.t('playlist.dialog.image_url')}
                                    type="text"
                                    fullWidth
                                    variant='flat'
                                    autoComplete='off'
                                />
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    minRows={5}
                                    maxRows={5}
                                    maxLength={500}
                                    variant='flat'
                                    placeholder={i18next.t('playlist.dialog.description')}
                                />
                            </aside>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={handleClose}>
                                {i18next.t('general.cancel')}
                            </Button>
                            <Button color="primary" onPress={handleFinish}>
                                {i18next.t('general.done')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default PlaylistDialog