import React, { useCallback, useEffect, useMemo, useState } from 'react'
import memoize from 'fast-memoize'
import { Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, TextField } from '@mui/material'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '@/stores'
import { tracks, Track } from '@/fake-api/search-results'
import { isEnvBrowser, isUrl, useDebounce } from '@/utils/misc'
import { setPlaylist, setWaitingForResponse } from '@/stores/Main'
import { fetchNui } from '@/utils/fetchNui'
import { toast } from 'react-toastify'
import { QueryResult } from '@/utils/types'
import { BiSearch } from 'react-icons/bi'
import i18next from 'i18next'


const YOUTUBE_URL = 'https://www.youtube.com/watch?v='

const SearchTrack = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const { playlist, waitingForResponse } = useAppSelector(state => state.Main)
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>(isEnvBrowser() ? tracks : [])
    const dispatch = useAppDispatch()
    const queryDebounced = useDebounce(query, 500)
    const [searchResultsAnimationParent] = useAutoAnimate()
    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('')
    }, []);

    const handlePlay = useMemo(() => memoize(async (track: Track) => {
        handleClose()
        const soundData = {
            id: nanoid(),
            soundId: nanoid(),
            title: track?.name ?? i18next.t('general.unknown'),
            artist: track?.artists?.[0]?.name ?? i18next.t('general.unknown'),
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
            return toast.error(i18next.t('search_track.invalid_url'))
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
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{i18next.t('search_track.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <p>{i18next.t('search_track.content')}</p>
                </DialogContentText>
                <div className='flex items-center justify-between'>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="url"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        label={i18next.t('search_track.placeholder')}
                        type="url"
                        fullWidth
                        variant="standard"
                        autoComplete='off'
                        disabled={waitingForResponse}
                    />
                    <IconButton aria-label="search">
                        <BiSearch size={24} color='#fff' />
                    </IconButton>
                </div>
                <a className='text-red-500 text-sm'>{i18next.t('search_track.knowledge')}</a>
                <ul ref={searchResultsAnimationParent} className='flex flex-col gap-2 max-h-120 overflow-y-auto md:max-h-96 sm:max-h-64'>
                    {trackList.length > 0 && <div className='mt-2 bg-zinc-800 rounded-lg flex flex-col gap-4 border-b border-zinc-700 last:border-b-0'>
                        {trackList.map(track => <li key={track.id} className='flex gap-2 items-center cursor-pointer hover:bg-zinc-700 p-2 rounded-lg' onClick={() => handlePlay(track)}>
                            <img src={track.thumbnails[0].url} alt={track.name ?? ''} className='w-16 h-16 rounded-lg' />
                            <div className='flex flex-col'>
                                <span className='text-white'>{track.name ?? i18next.t('general.unknown')}</span>
                                <span className='text-gray-400'>{track?.artists?.[0]?.name ?? i18next.t('general.unknown')}</span>
                            </div>
                        </li>)}
                    </div>}
                </ul>
            </DialogContent>
        </Dialog>
    )
}

export default SearchTrack