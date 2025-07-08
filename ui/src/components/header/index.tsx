import { memo, useCallback, useMemo, useState } from 'react';
import Info from './info'
import { Avatar, Button, Card, CardBody, CardFooter, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Kbd, useDisclosure } from '@heroui/react';
import Control from './control';
import Timer from './control/timer';
import Volume from './volume';
import { useAppSelector } from '@/stores';
import i18next from 'i18next';
import classNames from 'classnames';
import { IoSettings } from 'react-icons/io5';
import { motion } from 'framer-motion';
import SettingsModal from '../modals/Settings';
import ProfileModal from '../modals/Profile';
import { fetchNui } from '@/utils/fetchNui';

type HeaderProps = {
    isShort?: boolean
}

const Header = ({ isShort }: HeaderProps) => {
    const { playlist, currentSongData, userData } = useAppSelector(state => state.Main)
    const currentPlaylistName = useMemo(() => {
        return playlist?.find?.(playlist => playlist.id === currentSongData?.playlistId)?.name
    }, [playlist, currentSongData])
    const [timeStamp, setTimeStamp] = useState(0)
    const { isOpen: isSettingsModalOpen, onOpenChange: isSettingsModalOnOpenChange, onOpen: settingsModalOnOpen } = useDisclosure();
    const { isOpen: isProfileModalOpen, onOpenChange: isProfileModalOnOpenChange, onOpen: profileModalOnOpen } = useDisclosure();
    const logout = useCallback(async () => {
        fetchNui('logout')
    }, [])
    return (
        <>
            <SettingsModal isOpen={isSettingsModalOpen} onOpenChange={isSettingsModalOnOpenChange} />
            <ProfileModal isOpen={isProfileModalOpen} onOpenChange={isProfileModalOnOpenChange} userData={userData} />
            <header className='flex justify-center w-full items-center gap-24'>
                {isShort && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-rose-900/20"
                        animate={{
                            background: [
                                "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                            ]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
                <motion.div
                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    className="w-full h-full"
                >
                    <Card className={classNames({
                        'w-full h-full bg-black/20 border border-rose-500/20 shadow-lg': !isShort,
                        'w-full h-full bg-black/70 border border-rose-500/20 shadow-lg': isShort
                    })}>
                        <CardBody className={classNames({
                            'px-4 pt-2 pb-0 grid grid-cols-3': true,
                            'gap-4 flex flex-row grid-cols-2': isShort
                        })}>
                            <Info isShort={isShort} />
                            <article className='w-full flex flex-col'>
                                <motion.h1
                                    className='text-2xl truncate m-auto mb-5 bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent font-bold'
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                >
                                    {currentPlaylistName ?? i18next.t('header.playlist')}
                                </motion.h1>
                                <Control timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                                <Timer timeStamp={timeStamp} setTimeStamp={setTimeStamp} />
                            </article>
                            {!isShort && (
                                <Volume />
                            )}
                        </CardBody>
                        <CardFooter className='gap-2 items-center justify-center bg-black/10 border-t border-rose-500/10'>
                            <motion.div
                                className='flex gap-1 text-sm items-center text-gray-300'
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                            >
                                <Kbd keys={["shift"]} className="bg-rose-500/20 border-rose-500/30 text-rose-400">K</Kbd>
                                {i18next.t('keyboard.shortcut.toggle')}
                            </motion.div>
                            <motion.div
                                className='flex gap-1 text-sm items-center text-gray-300'
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                            >
                                <Kbd keys={["shift"]} className="bg-rose-500/20 border-rose-500/30 text-rose-400">Arrow Up/Down</Kbd>
                                {i18next.t('keyboard.shortcut.volume')}
                            </motion.div>
                            <motion.div
                                className='flex gap-1 text-sm items-center text-gray-300'
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                            >
                                <Kbd keys={["shift"]} className="bg-rose-500/20 border-rose-500/30 text-rose-400">Arrow Left/Right</Kbd>
                                {i18next.t('keyboard.shortcut.forward')}
                            </motion.div>
                            {!isShort && (
                                <div className='absolute right-2 bottom-2 flex gap-2'>
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <Button
                                            className='relative bg-black/20 border border-rose-500/30 hover:border-rose-400/50 hover:bg-black/30 text-rose-400'
                                            isIconOnly
                                            size='sm'
                                            onPress={settingsModalOnOpen}
                                        >
                                            <IoSettings size={18} />
                                        </Button>
                                    </motion.div>
                                    <Dropdown>
                                        <DropdownTrigger>
                                            <Button
                                                className='relative bg-black/20 border border-rose-500/30 hover:border-rose-400/50 hover:bg-black/30 rounded-full'
                                                isIconOnly
                                                size='sm'
                                            >
                                                <Avatar size='sm' className='w-full h-full bg-gradient-to-br from-rose-400 to-red-400' name={userData?.firstname?.charAt(0)?.toUpperCase()} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu aria-label="Static Actions" className="bg-black/90 border border-rose-500/20">
                                            {userData?.isOwner ? (
                                                <DropdownItem key="edit" onPress={profileModalOnOpen} className="text-white hover:bg-rose-500/20">Edit Profile</DropdownItem>
                                            ) : null}
                                            <DropdownItem key="delete" className="text-danger hover:bg-red-500/20" color="danger" onPress={logout}>
                                                Logout
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>
            </header >
        </>
    )
}

export default memo(Header)