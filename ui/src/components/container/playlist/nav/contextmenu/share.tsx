import { Playlist } from '@/fake-api/playlist-categories'
import { fetchNui } from '@/utils/fetchNui'
import { Player } from '@/utils/types'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import i18next from 'i18next'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const Share = ({ open, setOpen, currentPlaylist }: { open: boolean, setOpen: (open: boolean) => void, currentPlaylist?: Playlist }) => {
    const [players, setPlayers] = useState<Player[]>([])
    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);
    const [parent] = useAutoAnimate()
    useEffect(() => {
        fetchNui<Player[]>('getNearbyPlayers').then((players) => {
            if (!players || players.length === 0) {
                toast.error(i18next.t('shared.no_players'))
                return setOpen(false)
            }
            setPlayers(players)
        })
    }, [])
    const handleShare = useCallback((player: Player) => {
        setOpen(false)
        toast.success(i18next.t('shared.success'))
        fetchNui('sharePlaylist', { player: +player.source, playlist: currentPlaylist })
    }, [])
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{i18next.t('shared.title')}</DialogTitle>
            <DialogContent>
                <ul ref={parent} className='flex flex-col gap-2 w-72 max-h-120 overflow-y-auto md:max-h-96 sm:max-h-64'>
                    {players?.length > 0 && <div className='mt-2 bg-zinc-800 rounded-lg flex flex-col gap-4 border-b border-zinc-700 last:border-b-0'>
                        {players.map(player => <li key={player.source} className='flex gap-2 items-center cursor-pointer hover:bg-zinc-700 p-2 rounded-lg' onClick={() => handleShare(player)}>
                            <div className='flex flex-col'>
                                <span className='text-white'>{player.name ?? i18next.t('general.unknown')}</span>
                            </div>
                        </li>)}
                    </div>}
                </ul>
            </DialogContent>
        </Dialog>
    )
}

export default Share