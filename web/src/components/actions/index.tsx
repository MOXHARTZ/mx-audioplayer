import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setCurrentSongs, setEditMode, setFilterPlaylist, setSelectedSongs } from '@/stores/Main'
import { memo, useCallback, useState } from 'react'
import { BiSearch } from 'react-icons/bi'
import SearchTrack from './search'
import i18next from 'i18next'
import { Button, ButtonGroup, Input, useDisclosure } from '@heroui/react'
import { motion } from 'framer-motion'
import ConfirmModal from '../modals/ConfirmModal'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { notification } from '@/utils/misc'

const Actions = () => {
    const { editMode, selectedSongs, position, filterPlaylist, currentSongs } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const { isOpen: confirmIsOpen, onOpenChange: confirmOnOpenChange, onOpen: onConfirmOpen } = useDisclosure();
    const handleConfirm = useCallback(() => {
        dispatch(setCurrentSongs([]))
        notification(i18next.t('playlist.cleared'), 'success')
        dispatch(clearSound())
        dispatch(setEditMode(false))
    }, [])
    const [open, setOpen] = useState(false);
    const handleClickOpen = useCallback(() => {
        if (!currentSongs) return notification(i18next.t('playlist.select_playlist'), 'error')
        setOpen(true);
    }, [currentSongs]);
    const deleteSelectedSongs = useCallback(() => {
        if (currentSongs?.length === 0) return notification(i18next.t('playlist.empty'), 'error');
        if (selectedSongs.length === 0) return notification(i18next.t('playlist.not_selected'), 'error')
        dispatch(setCurrentSongs(currentSongs?.filter(song => !selectedSongs.includes(song.id.toString())) ?? []))
        notification(i18next.t('playlist.deleted_songs'), 'success')
        if (selectedSongs && position) selectedSongs.includes(position.toString()) && dispatch(clearSound())
        dispatch(setSelectedSongs([]))
        dispatch(setEditMode(false))
    }, [selectedSongs, currentSongs])
    const deleteAll = useCallback(() => {
        if (currentSongs?.length === 0) return notification(i18next.t('playlist.empty'), 'error');
        onConfirmOpen()
    }, [currentSongs])
    const toggleEditMode = useCallback(() => {
        const newEditMode = !editMode
        if (newEditMode) {
            notification(i18next.t('general.edit_enabled'), 'info')
            dispatch(setFilterPlaylist(''))
        }
        dispatch(setEditMode(newEditMode))
        if (!newEditMode) dispatch(setSelectedSongs([]));
    }, [currentSongs, editMode])

    const handleFilterPlaylist = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setFilterPlaylist(e.target.value))
    }
    const [autoAnimate] = useAutoAnimate()
    return (
        <motion.section
            className='flex flex-row items-center justify-end mb-5 mt-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <aside className='w-[7.5rem]'></aside>
            <aside className='flex justify-between gap-2 w-full' ref={autoAnimate}>
                <div></div>
                <section>
                    {!editMode &&
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                        >
                            <Input
                                radius="lg"
                                size='md'
                                placeholder={i18next.t('playlist.search')}
                                value={filterPlaylist}
                                onChange={handleFilterPlaylist}
                                classNames={{
                                    input: "bg-black/20 border-rose-500/30 text-white placeholder:text-gray-500",
                                    inputWrapper: "bg-black/20 border-rose-500/30 hover:border-rose-400/50 focus-within:border-rose-400"
                                }}
                                startContent={
                                    <BiSearch className="text-rose-400 mb-0.5 pointer-events-none flex-shrink-0" />
                                }
                            />
                        </motion.div>
                    }
                </section>
                {!editMode &&
                    <section className='flex items-center gap-2'>
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, }}
                        >
                            <Button
                                isIconOnly
                                className="bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                                aria-label="add song"
                                onPress={handleClickOpen}
                            >
                                <IoAddOutline size={24} />
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <Button
                                isIconOnly
                                className="bg-black/20 border border-rose-500/30 text-rose-400 hover:border-rose-400/50 hover:bg-black/30"
                                aria-label="edit playlist"
                                onPress={toggleEditMode}
                            >
                                <MdEdit size={24} />
                            </Button >
                        </motion.div>
                    </section>
                }
                {editMode &&
                    <ButtonGroup variant='faded' className="flex gap-2">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                        >
                            <Button
                                color='danger'
                                onPress={deleteAll}
                                className="bg-red-500/20 border border-red-500/30 text-red-400 hover:border-red-400/50 hover:bg-red-500/30"
                            >
                                {i18next.t('edit.clear')}
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                        >
                            <Button
                                onPress={deleteSelectedSongs}
                                className="bg-black/20 border border-rose-500/30 text-rose-400 hover:border-rose-400/50 hover:bg-black/30"
                            >
                                {`${i18next.t('edit.delete')} (${selectedSongs.length})`}
                            </Button>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 250, damping: 15 }}
                        >
                            <Button
                                color='success'
                                onPress={toggleEditMode}
                                className="bg-green-500/20 border border-green-500/30 text-green-400 hover:border-green-400/50 hover:bg-green-500/30"
                            >
                                {i18next.t('general.done')}
                            </Button>
                        </motion.div>
                    </ButtonGroup>
                }
            </aside>
            <ConfirmModal
                isOpen={confirmIsOpen}
                onOpenChange={confirmOnOpenChange}
                title={i18next.t('playlist.confirm.delete_all.title')}
                handleConfirm={handleConfirm}
            >
                <p>{i18next.t('playlist.confirm.delete_all.content')}</p>
            </ConfirmModal>
            <SearchTrack open={open} setOpen={setOpen} />
        </motion.section>

    )
}

export default memo(Actions)