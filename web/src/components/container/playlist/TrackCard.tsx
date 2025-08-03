import { Song } from "@/fake-api/song";
import { Avatar, Button, Checkbox, Chip } from "@heroui/react";
import classNames from "classnames";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { IoPlayOutline, IoPauseOutline } from "react-icons/io5";
import { SortableItem } from "react-easy-sort";

type TrackCardProps = {
    song: Song;
    onClick: () => void;
    position?: string | number;
    editMode: boolean;
    selected: boolean;
    toggleSelectedSong: (id: string) => void;
}

export default function TrackCard({
    song,
    onClick,
    position,
    editMode,
    selected,
    toggleSelectedSong
}: TrackCardProps) {
    const currentlyPlaying = useMemo(() => position && position === song.id, [position, song.id]);

    const container = (children: React.ReactNode) => {
        if (editMode) {
            return (
                <SortableItem key={song.id}>
                    <div className="h-full">
                        {children}
                    </div>
                </SortableItem>
            )
        }
        return children
    }

    return (
        container(
            <>
                <div
                    className={classNames({
                        "relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer": true,
                        "bg-black/20 border border-rose-500/20 hover:bg-black/30 hover:border-rose-400/40": !currentlyPlaying,
                        "bg-rose-500/20 border-rose-400/50 ring-2 ring-rose-400/30 shadow-lg shadow-rose-500/25": currentlyPlaying,
                        "cursor-none select-none": editMode
                    })}
                    onClick={!editMode ? onClick : undefined}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={currentlyPlaying ? { opacity: 0.1 } : { opacity: 0 }}
                    />

                    <div className="relative p-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <motion.div
                                    animate={currentlyPlaying ? { rotate: 360 } : { rotate: 0 }}
                                    transition={{
                                        duration: 3,
                                        repeat: currentlyPlaying ? Infinity : 0,
                                        ease: "linear"
                                    }}
                                    className="relative"
                                >
                                    <Avatar
                                        isBordered
                                        radius="full"
                                        size="lg"
                                        src={song.cover}
                                        className={classNames(
                                            "border-2 transition-all duration-300",
                                            currentlyPlaying
                                                ? "border-rose-400 shadow-lg shadow-rose-500/25"
                                                : "border-rose-500/30 group-hover:border-rose-400/50"
                                        )}
                                    />

                                    {currentlyPlaying && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                            <IoPauseOutline size={20} className="text-white" />
                                        </div>
                                    )}
                                </motion.div>

                                {currentlyPlaying && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-400 rounded-full flex items-center justify-center"
                                    >
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {editMode && (
                                        <Checkbox
                                            onChange={() => toggleSelectedSong(song.id)}
                                            isSelected={selected}
                                            color="danger"
                                            classNames={{
                                                base: "bg-black/20 border-rose-500/30",
                                                icon: "text-rose-400"
                                            }}
                                        />
                                    )}

                                    <h4 className="text-sm font-semibold text-white truncate">
                                        {song.title}
                                    </h4>

                                    {currentlyPlaying && (
                                        <Chip
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            className="bg-rose-500/20 text-rose-400 border border-rose-400/30"
                                        >
                                            Playing
                                        </Chip>
                                    )}
                                </div>

                                <p className="text-xs text-gray-400 truncate">
                                    {song.artist}
                                </p>
                            </div>
                            <Button
                                className={classNames({
                                    "bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40": !currentlyPlaying,
                                    "bg-black/20 border border-rose-400/50 text-rose-400 hover:bg-black/30": currentlyPlaying
                                })}
                                radius="full"
                                size="sm"
                                variant={currentlyPlaying ? "bordered" : "solid"}
                                onPress={onClick}
                                isIconOnly
                            >
                                {currentlyPlaying ? (
                                    <IoPauseOutline size={16} />
                                ) : (
                                    <IoPlayOutline size={16} />
                                )}
                            </Button>
                        </div>
                    </div>

                    {editMode && selected && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-rose-500/10 border-2 border-rose-400/50 rounded-xl"
                        />
                    )}
                </div>

                <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    animate={currentlyPlaying ? { opacity: 0.1 } : { opacity: 0 }}
                />
            </>
        )
    );
}