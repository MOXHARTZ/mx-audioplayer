import React, { useCallback, useMemo, useState } from 'react'
import memoize from 'fast-memoize'
import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, TextField } from '@mui/material'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { nanoid } from '@reduxjs/toolkit'
import { useAppDispatch, useAppSelector } from '@/stores'
import { tracks, Track } from '@/fake-api/search-results'
import { isEnvBrowser, isSpotifyAlbum, isSpotifyPlaylist, isUrl, getYoutubePlaylistID, YOUTUBE_URL } from '@/utils/misc'
import { setCurrentSongs, setWaitingForResponse } from '@/stores/Main'
import { fetchNui } from '@/utils/fetchNui'
import { toast } from 'react-toastify'
import { QueryResult } from '@/utils/types'
import { BiSearch } from 'react-icons/bi'
import i18next from 'i18next'
import classNames from 'classnames'

const SearchTrack = ({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) => {
    const { waitingForResponse, currentSongs } = useAppSelector(state => state.Main)
    const [query, setQuery] = useState('')
    const [trackList, setTrackList] = useState<Track[]>(isEnvBrowser() ? tracks : [])
    const dispatch = useAppDispatch()
    const [searchResultsAnimationParent] = useAutoAnimate()
    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('')
    }, []);
    const addAll = useCallback(() => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'))
        if (trackList.length === 0) return;
        const _trackList = trackList.map(track => ({ ...track, id: nanoid() }))
        const _trackListData = _trackList.map(track => ({
            id: nanoid(),
            soundId: nanoid(),
            title: track.name ?? i18next.t('general.unknown'),
            artist: track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown'),
            cover: track.thumbnails[0].url,
            url: track.videoId,
            duration: 0,
        }))
        dispatch(setCurrentSongs([...currentSongs, ..._trackListData]))
        handleClose()
    }, [trackList, currentSongs])
    const handlePlay = useMemo(() => memoize(async (track: Track) => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'));
        handleClose()
        const artist = track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown')

        const soundData = {
            id: nanoid(),
            soundId: nanoid(),
            title: track?.name ?? i18next.t('general.unknown'),
            artist,
            cover: track.thumbnails[0].url,
            url: track.videoId,
            duration: 0,
        }
        dispatch(setCurrentSongs([...currentSongs, soundData]))
    }), [setCurrentSongs, currentSongs])

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
        if (!query) return setTrackList([])
        const _query = query.replace(/\s/g, '%20').replace(/\/intl-[a-z]{2}\//, '/')
        const isTracks = getYoutubePlaylistID(_query) || isSpotifyPlaylist(_query) || isSpotifyAlbum(_query)
        const getInfo = isUrl(_query) && !isTracks
        if (getInfo) return processUrl(_query)
        dispatch(setWaitingForResponse(true))
        const endPoint = isTracks ? 'searchTracks' : 'searchQuery'
        let result = await fetchNui<QueryResult>(endPoint, { query: _query })
        dispatch(setWaitingForResponse(false))
        if (!result) return setTrackList([])
        if (typeof result === 'object' && 'error' in result) return toast.error(result.error)
        if (!result) return setTrackList([])
        result = result.map(track => ({ ...track, id: nanoid(), videoId: track.videoId && `${YOUTUBE_URL}${track.videoId}` }))
        setTrackList(result)
    }, [query])
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{i18next.t('search_track.title')}</DialogTitle>
            <DialogContent>
                <header className='flex flex-col'>
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
                            onKeyDown={e => e.key === 'Enter' && fetchTrackList()}
                        />
                        <IconButton aria-label="search" onClick={fetchTrackList}>
                            <BiSearch size={24} color='#fff' />
                        </IconButton>
                    </div>
                    <p className='text-red-500 text-sm'>{i18next.t('search_track.knowledge')}</p>
                </header>
                <ul ref={searchResultsAnimationParent} className={classNames({
                    'flex flex-col gap-2 max-h-120 overflow-y-auto md:max-h-96 sm:max-h-64 rounded-lg p-2': true,
                    'bg-neutral-700': trackList.length > 0
                })}>
                    {trackList.length > 0 && <div className='mt-2 rounded-lg flex flex-col gap-4 border-b last:border-b-0'>
                        {trackList.map(track => <li key={track.id} className='flex gap-2 items-center cursor-pointer bg-zinc-800 hover:bg-zinc-900 p-2 rounded transition-colors' onClick={() => handlePlay(track)}>
                            <img src={track.thumbnails[0].url} alt={track.name ?? ''} className='w-16 h-16 rounded-lg' />
                            <div className='flex flex-col'>
                                <span className='text-white'>{track.name ?? i18next.t('general.unknown')}</span>
                                <span className='text-gray-400'>{track?.artist ? track?.artist?.name : track?.artists?.[0]?.name ?? i18next.t('general.unknown')}</span>
                            </div>
                        </li>)}
                    </div>}
                </ul>
                {trackList.length > 0 && (
                    <footer className='mt-3 flex justify-end gap-2'>
                        <Button variant='contained' color='error' onClick={handleClose}>{i18next.t('general.cancel')}</Button>
                        <Button variant='contained' onClick={addAll} color='info'>{i18next.t('search_track.add_all')}</Button>
                    </footer>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default SearchTrack