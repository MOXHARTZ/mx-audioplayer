import { Button, Dialog, DialogContent, DialogTitle, TextField, TextareaAutosize } from '@mui/material'
import i18next from 'i18next'
import { useCallback, useState } from 'react';
import Image from '../image';
import { Playlist } from '@/fake-api/playlist-categories';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/stores';
import { addPlaylist, updatePlaylist } from '@/stores/Main';
import { nanoid } from '@reduxjs/toolkit';
import { isEmpty } from '@/utils/misc';
import classNames from 'classnames';

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
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{currentPlaylist ? i18next.t('playlist.dialog.edit') : i18next.t('playlist.dialog.create')}</DialogTitle>
            <DialogContent>
                <section className='grid grid-cols-2 gap-2 mb-5'>
                    <Image
                        playlist={currentPlaylist}
                        className={classNames({
                            'w-64 h-64': true,
                            'bg-zinc-500': isEmpty(image),
                            'rounded-md flex items-center justify-center': !currentPlaylist
                        })}
                        url={image}
                    />
                    <aside>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            label={i18next.t('playlist.dialog.name')}
                            type="text"
                            fullWidth
                            variant="filled"
                            autoComplete='off'
                            required
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="image-url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            label={i18next.t('playlist.dialog.image_url')}
                            type="text"
                            fullWidth
                            variant="filled"
                            autoComplete='off'
                        />
                        <TextareaAutosize
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className='w-full mt-2 p-2 rounded-md bg-zinc-800 text-white'
                            minRows={5}
                            maxRows={5}
                            maxLength={500}
                            placeholder={i18next.t('playlist.dialog.description')}
                        />
                    </aside>
                </section>
                <footer className='flex flex-row gap-4'>
                    <Button className='mt-5 flex flex-end self-end w-full justify-end' variant='contained' size='large' onClick={handleClose} color="error">
                        {i18next.t('general.cancel')}
                    </Button>
                    <Button className='mt-5 flex flex-end self-end w-full justify-end' variant='contained' size='large' onClick={handleFinish} color="info" disabled={!name}>
                        {i18next.t('general.done')}
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
}

export default PlaylistDialog