import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, TextField } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setEditMode, setPlaylist, setSelectedSongs } from '@/stores/Main'
import { memo, useCallback, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'react-toastify';
import { fetchNui } from '@/utils/fetchNui'
import { nanoid } from '@reduxjs/toolkit'

const Actions = () => {
    const { editMode, selectedSongs, playlist, position } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
    const [soundUrl, setSoundUrl] = useState('')
    const deleteSelectedSongs = useCallback(() => {
        if (playlist.length === 0) return toast.error('Playlist is empty');
        if (selectedSongs.length === 0) return toast.error('No songs selected');
        dispatch(setPlaylist(playlist.filter(song => !selectedSongs.includes(song.id))))
        toast.success('Songs deleted successfully')
        const id = playlist[position]?.id
        if (selectedSongs && id) selectedSongs.includes(id) && dispatch(clearSound())
        dispatch(setSelectedSongs([]))
        dispatch(setEditMode(false))
    }, [selectedSongs, playlist])
    const toggleEditMode = useCallback(() => {
        const newEditMode = !editMode
        dispatch(setEditMode(newEditMode))
        if (!newEditMode) dispatch(setSelectedSongs([]))
    }, [editMode])
    const [open, setOpen] = useState(false);
    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, []);
    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);
    const handlePlay = useCallback(async () => {
        handleClose()
        if (!soundUrl) return;
        console.log(soundUrl)
        const response = await fetchNui<{ title: string; artist: string; thumbnail: string }>('getSoundData', { url: soundUrl })
        if (!response) return toast.error('Invalid url');
        console.log(response)
        const soundData = {
            id: nanoid(),
            soundId: nanoid(),
            title: response?.title,
            artist: response?.artist,
            cover: response?.thumbnail,
            url: soundUrl,
            duration: 0,
        }
        dispatch(setPlaylist([...playlist, soundData]))
    }, [soundUrl]);
    return (
        <aside className='self-end flex justify-end gap-2' ref={animationParent}>
            {!editMode && <>
                <IconButton aria-label="add song" onClick={handleClickOpen}>
                    <IoAddOutline size={24} color='#fff' />
                </IconButton>
                <IconButton aria-label="edit playlist" onClick={toggleEditMode}>
                    <MdEdit size={24} color='#fff' />
                </IconButton >
            </>
            }
            {editMode && <>
                <Button variant='contained' color='error' onClick={deleteSelectedSongs}>Delete</Button>
                <Button variant='contained' color='primary' onClick={toggleEditMode}>Cancel</Button>
            </>
            }
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Enter a url</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can add a song to the playlist by entering a url. You can use any url from youtube, soundcloud and spotify. (Except the playlist url)
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="url"
                        value={soundUrl}
                        onChange={(e) => setSoundUrl(e.target.value)}
                        label="Song Url"
                        type="url"
                        fullWidth
                        variant="standard"
                        autoComplete='off'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handlePlay}>Play</Button>
                </DialogActions>
            </Dialog>
        </aside>
    )
}

export default memo(Actions)