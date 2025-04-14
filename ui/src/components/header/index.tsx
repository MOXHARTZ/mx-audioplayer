import { memo, useMemo, useState } from 'react';
import Info from './info'
import { Avatar, Button, Card, CardBody, CardFooter, Kbd, useDisclosure } from '@heroui/react';
import Control from './control';
import Timer from './control/timer';
import Volume from './volume';
import { useAppSelector } from '@/stores';
import i18next from 'i18next';
import classNames from 'classnames';
import { IoSettings } from 'react-icons/io5';
import SettingsModal from '../modals/Settings';
import ProfileModal from '../modals/Profile';

type HeaderProps = {
    isShort?: boolean
}

const Header = ({ isShort }: HeaderProps) => {
    const { playlist, currentSongData, userData } = useAppSelector(state => state.Main)
    const currentPlaylistName = useMemo(() => {
        return playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.name
    }, [playlist, currentSongData])
    const [timeStamp, setTimeStamp] = useState(0)
    const { isOpen: isSettingsModalOpen, onOpenChange: isSettingsModalOnOpenChange, onOpen: settingsModalOnOpen } = useDisclosure();
    const { isOpen: isProfileModalOpen, onOpenChange: isProfileModalOnOpenChange, onOpen: profileModalOnOpen } = useDisclosure();
    return (
        <>
            <SettingsModal isOpen={isSettingsModalOpen} onOpenChange={isSettingsModalOnOpenChange} />
            <ProfileModal isOpen={isProfileModalOpen} onOpenChange={isProfileModalOnOpenChange} userData={userData} />
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
                            <div className='absolute right-2 bottom-2 flex gap-2'>
                                <Button
                                    className='relative'
                                    isIconOnly
                                    size='sm'
                                    color='default'
                                    onPress={settingsModalOnOpen}
                                >
                                    <IoSettings size={18} />
                                </Button>
                                <Button
                                    className='relative bg-transparent'
                                    isIconOnly
                                    size='sm'
                                    color='default'
                                    onPress={profileModalOnOpen}
                                >
                                    <Avatar size='sm' className='w-full h-full' name={userData?.firstname?.charAt(0)?.toUpperCase()} />
                                </Button>
                            </div>

                        )}
                    </CardFooter>
                </Card>
            </header >
        </>

    )
}

export default memo(Header)