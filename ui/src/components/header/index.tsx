import { memo, useMemo, useState } from 'react';
import Info from './info'
import { Button, Card, CardBody, CardFooter, Kbd, useDisclosure } from '@heroui/react';
import Control from './control';
import Timer from './control/timer';
import Volume from './volume';
import { useAppSelector } from '@/stores';
import i18next from 'i18next';
import classNames from 'classnames';
import { IoSettings } from 'react-icons/io5';
import SettingsModal from '../modals/Settings';

type HeaderProps = {
    isShort?: boolean
}

const Header = ({ isShort }: HeaderProps) => {
    const { playlist, currentSongData } = useAppSelector(state => state.Main)
    const currentPlaylistName = useMemo(() => {
        return playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.name
    }, [playlist, currentSongData])
    const [timeStamp, setTimeStamp] = useState(0)
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    return (
        <>
            <SettingsModal isOpen={isOpen} onOpenChange={onOpenChange} />
            <header className='flex justify-center w-full items-center gap-24'>
                <Card className='w-full h-full'>
                    <CardBody className={classNames({
                        'px-4 pt-2 pb-0 grid grid-cols-3': true,
                        'gap-4 flex flex-row grid-cols-2': isShort
                    })}>
                        <Info isShort={isShort} />
                        <article className='w-full flex flex-col'>
                            <h1 className='text-2xl truncate m-auto mb-5'>{currentPlaylistName ?? i18next.t('header.playlist')}</h1>
                            <Control timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                            <Timer timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                        </article>
                        {!isShort && (
                            <Volume />
                        )}
                    </CardBody>
                    <CardFooter className='gap-2 items-center justify-center'>
                        <div className='flex gap-1 text-sm items-center'>
                            <Kbd keys={["shift"]}>K</Kbd>
                            {i18next.t('keyboard.shortcut.toggle')}
                        </div>
                        <div className='flex gap-1 text-sm items-center'>
                            <Kbd keys={["shift"]}>Arrow Up/Down</Kbd>
                            {i18next.t('keyboard.shortcut.volume')}
                        </div>
                        <div className='flex gap-1 text-sm items-center'>
                            <Kbd keys={["shift"]}>Arrow Left/Right</Kbd>
                            {i18next.t('keyboard.shortcut.forward')}
                        </div>
                        {!isShort && (
                            <Button
                                className='absolute right-2 bottom-2'
                                isIconOnly
                                size='sm'
                                color='default'
                                onPress={onOpen}
                            >
                                <IoSettings size={18} />
                            </Button >
                        )}
                    </CardFooter>
                </Card>
            </header >
        </>

    )
}

export default memo(Header)