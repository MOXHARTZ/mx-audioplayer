import { MdEdit } from 'react-icons/md'
import { IoAddOutline } from 'react-icons/io5'
import { Button, IconButton } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/stores'
import { clearSound, setEditMode, setFilterPlaylist, setPlaylist, setSelectedSongs } from '@/stores/Main'
import { memo, useCallback, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { toast } from 'react-toastify';
import { BiSearch } from 'react-icons/bi'
import InputBase from '@mui/material/InputBase';
import { styled, alpha } from '@mui/material/styles';
import SearchTrack from './search'
import i18next from 'i18next'

const Actions = () => {
    const { editMode, selectedSongs, playlist, position, filterPlaylist } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const [animationParent] = useAutoAnimate()
    const [open, setOpen] = useState(false);
    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, []);
    const deleteSelectedSongs = useCallback(() => {
        if (playlist.length === 0) return toast.error(i18next.t('playlist.empty'));
        if (selectedSongs.length === 0) return toast.error(i18next.t('playlist.not_selected'))
        dispatch(setPlaylist(playlist.filter(song => !selectedSongs.includes(song.id))))
        toast.success(i18next.t('playlist.deleted_songs'))
        if (selectedSongs && position) selectedSongs.includes(position.toString()) && dispatch(clearSound())
        dispatch(setSelectedSongs([]))
        dispatch(setEditMode(false))
    }, [selectedSongs, playlist])
    const deleteAll = useCallback(() => {
        if (playlist.length === 0) return toast.error(i18next.t('playlist.empty'));
        dispatch(setPlaylist([]))
        toast.success(i18next.t('playlist.cleared'))
        dispatch(clearSound())
        dispatch(setEditMode(false))
    }, [playlist])
    const toggleEditMode = useCallback(() => {
        const newEditMode = !editMode
        dispatch(setEditMode(newEditMode))
        if (!newEditMode) dispatch(setSelectedSongs([]))
    }, [editMode])
    return (
        <section className='flex flex-row items-center justify-between'>
            <aside>
                <div className='flex items-center gap-2'>
                    <Search>
                        <SearchIconWrapper>
                            <BiSearch />
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder={i18next.t('playlist.search')}
                            value={filterPlaylist}
                            onChange={(e) => dispatch(setFilterPlaylist(e.target.value))}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </Search>
                </div>
            </aside>
            <aside className='self-end flex justify-end gap-2' ref={animationParent}>
                {!editMode && <>
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
                    <Button variant='contained' color='primary' onClick={toggleEditMode}>{i18next.t('edit.cancel')}</Button>
                </>
                }
            </aside>
            <SearchTrack open={open} setOpen={setOpen} />
        </section>

    )
}

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
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
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

export default memo(Actions)