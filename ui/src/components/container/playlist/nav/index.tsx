import { useAppDispatch, useAppSelector } from '@/stores'
import { NavLink } from 'react-router-dom'
import PlaylistImage from './PlaylistImage'
import ContextMenu from './contextmenu'
import SortableList, { SortableItem } from "react-easy-sort";
import { setPlaylist } from '@/stores/Main'
import classNames from 'classnames'
import { arrayMoveImmutable } from 'array-move'
import { Tooltip } from '@nextui-org/react';

const PlaylistNav = () => {
    const { playlist, editMode } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const onSortEnd = (oldIndex: number, newIndex: number) => {
        dispatch(setPlaylist(arrayMoveImmutable(playlist, oldIndex, newIndex)))
    };
    return (
        <section className='w-[7.5rem] h-full shadow-xl bg-default-200/50 p-4 rounded-md overflow-y-auto relative'>
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
                        <Tooltip key={playlist.id} content={playlist.name} placement='right'>
                            <SortableItem key={playlist.id}>
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
                                    <PlaylistImage key={playlist.id} playlist={playlist} />
                                </NavLink>
                            </SortableItem>
                        </Tooltip>
                    </ContextMenu>
                ))}
            </SortableList>
        </section>
    )
}

export default PlaylistNav