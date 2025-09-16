import { useAppDispatch, useAppSelector } from '@/stores'
import { NavLink, useNavigate } from 'react-router-dom'
import PlaylistImage from './PlaylistImage'
import ContextMenu from './contextmenu'
import SortableList, { SortableItem } from "react-easy-sort";
import { setPlaylist } from '@/stores/Main'
import classNames from 'classnames'
import { arrayMoveImmutable } from 'array-move'
import { Tooltip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const PlaylistNav = () => {
    const { playlist, editMode, currentSongs } = useAppSelector(state => state.Main)
    const dispatch = useAppDispatch()
    const onSortEnd = (oldIndex: number, newIndex: number) => {
        dispatch(setPlaylist(arrayMoveImmutable(playlist, oldIndex, newIndex)))
    };
    const navigate = useNavigate()
    useEffect(() => {
        if (!currentSongs && playlist.length > 0) {
            navigate(`/playlist/${playlist[0].id}`)
        }
    }, [playlist, currentSongs])
    return (
        <motion.section
            className='w-[7.5rem] h-full shadow-xl bg-black/20 border border-rose-500/20 p-4 rounded-xl overflow-y-auto overflow-x-hidden relative'
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <div className='w-full h-full absolute z-0 inset-0'>
                <ContextMenu />
            </div>
            <SortableList
                onSortEnd={onSortEnd}
                className="list flex flex-col gap-2 z-10 relative"
                draggedItemClassName="dragged"
                allowDrag={editMode}
            >
                {playlist.map((playlist, index) => (
                    <ContextMenu key={playlist.id} disabled={editMode} playlist={playlist}>
                        <SortableItem key={playlist.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: index * 0.1
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Tooltip key={playlist.id} content={playlist.name} placement='right'>
                                    <NavLink
                                        to={`/playlist/${playlist.id}`}
                                        key={playlist.id}
                                        className={classNames({
                                            'flex items-center justify-center w-full h-18 p-2 rounded-lg text-white transition-all duration-300': true,
                                            'pointer-events-none cursor-grab select-none': editMode,
                                            'hover:bg-rose-500/20 hover:border hover:border-rose-400/50': !editMode
                                        })}
                                        style={({ isActive }) => ({
                                            backgroundColor: isActive ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                                            border: isActive ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid transparent'
                                        })}
                                    >
                                        <PlaylistImage key={playlist.id} playlist={playlist} />
                                    </NavLink>
                                </Tooltip>
                            </motion.div>
                        </SortableItem>
                    </ContextMenu>
                ))}
            </SortableList>
        </motion.section>
    )
}

export default PlaylistNav