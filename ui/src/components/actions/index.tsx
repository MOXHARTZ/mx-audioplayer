import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, TextField } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setEditMode, setPlaylist, setSelectedSongs, setWaitingForResponse } from '@/stores/Main'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'react-toastify';
import { fetchNui } from '@/utils/fetchNui'
import { nanoid } from '@reduxjs/toolkit'
import { IN_DEVELOPMENT, isUrl, useDebounce } from '@/utils/misc'
import { tracks, Track } from '@/fake-api/search-results'
import memoize from 'fast-memoize'
import { BiSearch } from 'react-icons/bi'
import { QueryResult } from '@/utils/types'

const YOUTUBE_URL = 'https://www.youtube.com/watch?v='

const Actions = () => {
    const { editMode, selectedSongs, playlist, position } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
    const [searchResultsAnimationParent] = useAutoAnimate()
    const [query, setQuery] = useState('')
    const queryDebounced = useDebounce(query, 500)
    const [trackList, setTrackList] = useState<Track[]>(IN_DEVELOPMENT ? tracks : [])
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
    const deleteAll = useCallback(() => {
        if (playlist.length === 0) return toast.error('Playlist is empty');
        dispatch(setPlaylist([]))
        toast.success('Playlist cleared successfully')
        dispatch(clearSound())
        dispatch(setEditMode(false))
    }, [playlist])
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
        setQuery('')
    }, []);
    const handlePlay = useMemo(() => memoize(async (track: Track) => {
        handleClose()
        const soundData = {
            id: nanoid(),
            soundId: nanoid(),
            title: track?.name ?? 'Unknown',
            artist: track?.artists?.[0]?.name ?? 'Unknown',
            cover: track.thumbnails[0].url,
            url: track.videoId,
            duration: 0,
        }
        dispatch(setPlaylist([...playlist, soundData]))
    }), [playlist])
    const processUrl = useCallback(async (url: string) => {
        dispatch(setWaitingForResponse(true))
        const response = await fetchNui<{ title: string; artist: string; thumbnail: string }>('getSoundData', { url: url })
        if (!response) {
            dispatch(setWaitingForResponse(false))
            return toast.error('Invalid url');
        }
        const _data = {
            id: nanoid(),
            artists: [{ name: response.artist, artistId: 'unknown' }],
            name: response.title,
            thumbnails: [{ url: response.thumbnail, width: 90, height: 90 }],
            videoId: url,
        }
        setTrackList([_data])
        dispatch(setWaitingForResponse(false))
    }, [])
    const fetchTrackList = useCallback(async () => {
        if (!queryDebounced) return setTrackList([])
        const queryIsUrl = isUrl(queryDebounced)
        if (queryIsUrl) return processUrl(queryDebounced)
        dispatch(setWaitingForResponse(true))
        const _query = queryDebounced.replace(/\s/g, '%20')
        let result = await fetchNui<QueryResult>('searchQuery', { query: _query })
        dispatch(setWaitingForResponse(false))
        if (!result) return setTrackList([])
        if (typeof result === 'object' && 'error' in result) return toast.error(result.error)
        if (!result) return setTrackList([])
        result = result.map(track => ({ ...track, id: nanoid(), videoId: `${YOUTUBE_URL}${track.videoId}` }))
        setTrackList(result)
    }, [queryDebounced])
    useEffect(() => {
        fetchTrackList()
    }, [queryDebounced])
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
                <Button variant='contained' color='error' onClick={deleteAll}>Delete All</Button>
                <Button variant='contained' color='warning' onClick={deleteSelectedSongs}>Delete</Button>
                <Button variant='contained' color='primary' onClick={toggleEditMode}>Cancel</Button>
            </>
            }
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Enter a track</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <a>You can add a song to the playlist by entering a track name or you can pass here by a spotify, youtube or soundcloud url</a>
                    </DialogContentText>
                    <div className='flex items-center justify-between'>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="url"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            label="Track name or url"
                            type="url"
                            fullWidth
                            variant="standard"
                            autoComplete='off'
                        />
                        <IconButton aria-label="search">
                            <BiSearch size={24} color='#fff' />
                        </IconButton>
                    </div>
                    <a className='text-red-500 text-sm'>You can't play songs with a song duration of more than 15 minutes (for performance reasons)</a>
                    <ul ref={searchResultsAnimationParent} className='flex flex-col gap-2 max-h-120 overflow-y-auto md:max-h-96 sm:max-h-64'>
                        {trackList.length > 0 && <div className='mt-2 bg-zinc-800 rounded-lg flex flex-col gap-4 border-b border-zinc-700 last:border-b-0'>
                            {trackList.map(track => <li key={track.id} className='flex gap-2 items-center cursor-pointer hover:bg-zinc-700 p-2 rounded-lg' onClick={() => handlePlay(track)}>
                                <img src={track.thumbnails[0].url} alt={track.name ?? ''} className='w-16 h-16 rounded-lg' />
                                <div className='flex flex-col'>
                                    <span className='text-white'>{track.name ?? 'Unknown'}</span>
                                    <span className='text-gray-400'>{track?.artists?.[0]?.name ?? 'Unknown'}</span>
                                </div>
                            </li>)}
                        </div>}
                    </ul>
                </DialogContent>
            </Dialog>
        </aside>
    )
}

export default memo(Actions)