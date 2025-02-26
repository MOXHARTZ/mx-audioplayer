import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setCurrentSongs, setEditMode, setFilterPlaylist, setSelectedSongs } from '@/stores/Main'
import { memo, useCallback, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'react-toastify';
import { BiSearch } from 'react-icons/bi'
import SearchTrack from './search'
import i18next from 'i18next'
import { Button, ButtonGroup, Input, useDisclosure } from '@heroui/react'
import ConfirmModal from '../modals/ConfirmModal'

const Actions = () => {
    const { editMode, selectedSongs, position, filterPlaylist, currentSongs } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
    const { isOpen: confirmIsOpen, onOpenChange: confirmOnOpenChange, onOpen: onConfirmOpen } = useDisclosure();
    const handleConfirm = useCallback(() => {
        dispatch(setCurrentSongs([]))
        toast.success(i18next.t('playlist.cleared'))
        dispatch(clearSound())
        dispatch(setEditMode(false))
    }, [])
    const [open, setOpen] = useState(false);
    const handleClickOpen = useCallback(() => {
        if (!currentSongs) return toast.error(i18next.t('playlist.select_playlist'))
        setOpen(true);
    }, [currentSongs]);
    const deleteSelectedSongs = useCallback(() => {
        if (currentSongs?.length === 0) return toast.error(i18next.t('playlist.empty'));
        if (selectedSongs.length === 0) return toast.error(i18next.t('playlist.not_selected'))
        dispatch(setCurrentSongs(currentSongs?.filter(song => !selectedSongs.includes(song.id.toString())) ?? []))
        toast.success(i18next.t('playlist.deleted_songs'))
        if (selectedSongs && position) selectedSongs.includes(position.toString()) && dispatch(clearSound())
        dispatch(setSelectedSongs([]))
        dispatch(setEditMode(false))
    }, [selectedSongs, currentSongs])
    const deleteAll = useCallback(() => {
        if (currentSongs?.length === 0) return toast.error(i18next.t('playlist.empty'));
        onConfirmOpen()

    }, [currentSongs])
    const toggleEditMode = useCallback(() => {
        const newEditMode = !editMode
        if (newEditMode) {
            toast.info(i18next.t('general.edit.enabled'))
            dispatch(setFilterPlaylist(''))
        }
        dispatch(setEditMode(newEditMode))
        if (!newEditMode) dispatch(setSelectedSongs([]));
    }, [currentSongs, editMode])
    return (
        <section className='flex flex-row items-center justify-end mb-5 mt-3'>
            <aside className='w-[7.5rem]'></aside>
            <aside className='flex justify-between gap-2 w-full' ref={animationParent}>
                <div></div>
                <section>
                    {!editMode &&
                        <Input
                            radius="md"
                            size='md'
                            placeholder={i18next.t('playlist.search')}
                            value={filterPlaylist}
                            onChange={(e) => dispatch(setFilterPlaylist(e.target.value))}
                            startContent={
                                <BiSearch className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                            }
                        />
                    }
                </section>
                {!editMode &&
                    <section className='flex items-center gap-2'>
                        <Button
                            isIconOnly
                            color='danger'
                            aria-label="add song"
                            onPress={handleClickOpen}
                        >
                            <IoAddOutline size={24} color='#fff' />
                        </Button>
                        <Button
                            isIconOnly
                            color='default'
                            aria-label="edit playlist"
                            onPress={toggleEditMode}
                        >
                            <MdEdit size={24} color='#fff' />
                        </Button >
                    </section>
                }
                {editMode &&
                    <ButtonGroup variant='faded'>
                        <Button color='danger' onPress={deleteAll}>{i18next.t('edit.clear')}</Button>
                        <Button onPress={deleteSelectedSongs} >{`${i18next.t('edit.delete')} (${selectedSongs.length})`}</Button>
                        <Button color='success' onPress={toggleEditMode}>{i18next.t('general.done')}</Button>
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
        </section>

    )
}

export default memo(Actions)