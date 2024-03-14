import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { Button, IconButton } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setCurrentSongs, setEditMode, setFilterPlaylist, setSelectedSongs } from '@/stores/Main'
import { memo, useCallback, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'react-toastify';
import { BiSearch } from 'react-icons/bi'
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import SearchTrack from './search'
import i18next from 'i18next'

const Actions = () => {
    const { editMode, selectedSongs, position, filterPlaylist, currentSongs } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
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
        dispatch(setCurrentSongs([]))
        toast.success(i18next.t('playlist.cleared'))
        dispatch(clearSound())
        dispatch(setEditMode(false))
    }, [currentSongs])
    const toggleEditMode = useCallback(() => {
        const newEditMode = !editMode
        if (newEditMode) toast.info(i18next.t('general.edit.enabled'))
        dispatch(setEditMode(newEditMode))
        if (!newEditMode) dispatch(setSelectedSongs([]));
    }, [currentSongs, editMode])
    return (
        <section className='flex flex-row items-center justify-end mb-3'>
            <aside className='self-end flex justify-end gap-2 w-full' ref={animationParent}>
                {!editMode && <>
                    <Search>
                        <SearchIconWrapper>
                            <BiSearch size={22} />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder={i18next.t('playlist.search')}
                            value={filterPlaylist}
                            onChange={(e) => dispatch(setFilterPlaylist(e.target.value))}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                    <IconButton aria-label="add song" onClick={handleClickOpen}>
                        <IoAddOutline size={24} color='#fff' />
                    </IconButton>
                    <IconButton aria-label="edit playlist" onClick={toggleEditMode}>
                        <MdEdit size={24} color='#fff' />
                    </IconButton >
                </>
                }
                {editMode && <>
                    <Button variant='contained' color='error' onClick={deleteAll}>{i18next.t('edit.clear')}</Button>
                    <Button variant='contained' color='warning' onClick={deleteSelectedSongs}>{i18next.t('edit.delete')}</Button>
                    <Button variant='contained' color='primary' onClick={toggleEditMode}>{i18next.t('general.done')}</Button>
                </>
                }
            </aside>
            <SearchTrack open={open} setOpen={setOpen} />
        </section>

    )
}

const Search = styled('div')(({ theme }) => ({
    '&:not(:has(.Mui-focused)):hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
        borderRadius: '99999px',
    },
    '& .Mui-focused': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 1.6),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 0, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1.5em + ${theme.spacing(3)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '0ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

export default memo(Actions)