import { Song } from "@/fake-api/song";
import { Card, CardHeader, Avatar, Button, Checkbox } from "@nextui-org/react";
import classNames from "classnames";
import i18next from "i18next";
import { useMemo } from "react";
import { SortableItem } from "react-easy-sort";

type TrackCardProps = {
    song: Song;
    onClick: () => void;
    position?: string | number;
    editMode: boolean;
    selected: boolean;
    toggleSelectedSong: (id: string) => void;
}

export default function TrackCard({ song, onClick, position, editMode, selected, toggleSelectedSong }: TrackCardProps) {
    const currentlyPlaying = useMemo(() => position && position === song.id, [position, song.id]);
    return (
        <SortableItem>
            <div>
                <Card
                    isPressable={!editMode}
                    onPress={onClick}
                    className={classNames({
                        "shadow-lg bg-default-200/50 cursor-pointer hover:bg-default-300 w-full text-left": true,
                        "bg-default-300 ring-pink-700 ring-2": currentlyPlaying,
                        'transition-all': !editMode,
                        'cursor-none select-none': editMode
                    })}>
                    <CardHeader className="gap-2">
                        {editMode &&
                            <aside>
                                <Checkbox
                                    onChange={() => toggleSelectedSong(song.id)}
                                    isSelected={selected}
                                    color="primary"
                                />
                            </aside>
                        }
                        <aside className="flex flex-row w-full justify-between items-center">
                            <div className="flex gap-5">
                                <Avatar isBordered radius="full" size="lg" src={song.cover} className={classNames({
                                    'animate-spin-slow': currentlyPlaying
                                })} />
                                <div className={classNames({
                                    'flex flex-col gap-1 items-start justify-center': true,
                                    'max-w-[80%]': !editMode,
                                    'max-w-[78%]': editMode
                                })}>
                                    <h4 className="text-small font-semibold leading-none text-default-600">{song.title}</h4>
                                    <h5 className="text-small tracking-tight text-default-400">{song.artist}</h5>
                                </div>
                            </div>
                            <Button
                                className={currentlyPlaying ? "bg-transparent text-foreground border-pink-700" : ""}
                                color={currentlyPlaying ? "primary" : "danger"}
                                radius="full"
                                size="sm"
                                variant={currentlyPlaying ? "bordered" : "solid"}
                                onPress={onClick}
                            >
                                {currentlyPlaying ? i18next.t('general.currently_playing') : i18next.t('general.play')}
                            </Button>
                        </aside>
                    </CardHeader>
                </Card>
            </div>
        </SortableItem>
    );
}