import { memo, useMemo, useState } from 'react';
import Info from './info'
import { Card } from '@nextui-org/react';
import Control from './control';
import Timer from './control/timer';
import Volume from './volume';
import { useAppSelector } from '@/stores';

const Header = () => {
    const { playlist, currentSongData } = useAppSelector(state => state.Main)
    const currentPlaylistName = useMemo(() => {
        return playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.name
    }, [playlist, currentSongData])
    const [timeStamp, setTimeStamp] = useState(0)
    return (
        <header className='flex justify-center w-full items-center gap-24'>
            <Card className='p-4 grid grid-cols-3'>
                <Info />
                <article className='w-full flex flex-col'>
                    <h1 className='text-2xl truncate m-auto mb-5'>{currentPlaylistName ?? 'Playlist'}</h1>
                    <Control timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                    <Timer timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                </article>
                <Volume />
            </Card>
        </header>
    )
}

export default memo(Header)