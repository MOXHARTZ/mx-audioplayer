import { useAppDispatch, useAppSelector } from '@/stores'
import { Tooltip } from '@mui/material'
import { NavLink } from 'react-router-dom'
import Image from './image'
import ContextMenu from './contextmenu'
import SortableList, { SortableItem } from "react-easy-sort";
import { setPlaylist } from '@/stores/Main'
import classNames from 'classnames'
import { arrayMoveImmutable } from 'array-move'

const PlaylistNav = () => {
    const { playlist, editMode } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const onSortEnd = (oldIndex: number, newIndex: number) => {
        dispatch(setPlaylist(arrayMoveImmutable(playlist, oldIndex, newIndex)))
    };
    return (
        <section className='w-[7.5rem] h-full bg-zinc-600 p-4 rounded-lg overflow-y-auto relative'>
            <div className='w-full h-full absolute z-0 inset-0'>
                <ContextMenu />
            </div>
            <SortableList
                onSortEnd={onSortEnd}
                className="list flex flex-col gap-2 z-10 relative"
                draggedItemClassName="dragged"
                allowDrag={editMode}
            >
                {playlist.map(playlist => (
                    <ContextMenu key={playlist.id} disabled={editMode} playlist={playlist}>
                        <SortableItem key={playlist.id}>
                            <Tooltip key={playlist.id} title={playlist.name} placement='right'>
                                <NavLink
                                    to={`/playlist/${playlist.id}`}
                                    key={playlist.id}
                                    className={classNames({
                                        'flex items-center justify-center w-full h-18 hover:!bg-zinc-700 p-2 rounded-lg text-white': true,
                                        'pointer-events-none cursor-grab select-none': editMode,
                                        'transition-colors': !editMode
                                    })} style={({ isActive }) => ({
                                        backgroundColor: isActive ? '#3f3f46' : 'transparent'
                                    })}>
                                    <Image key={playlist.id} playlist={playlist} />
                                </NavLink>
                            </Tooltip>
                        </SortableItem>
                    </ContextMenu>
                ))}
            </SortableList>
        </section>
    )
}

export default PlaylistNav