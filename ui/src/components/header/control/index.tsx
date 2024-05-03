import { FC, memo, useCallback, useEffect, useMemo } from 'react';
import useNuiEvent from '@/hooks/useNuiEvent';
import { setPlaying, setRepeat, setShuffle } from '@/stores/Main';
import { handlePlay } from '@/thunks/handlePlay';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import memoize from "fast-memoize";
import i18next from 'i18next';
import { Button } from "@nextui-org/react";
import { IoPauseCircle, IoPlayBack, IoPlayCircle, IoPlayForward, IoRepeat, IoShuffle } from "react-icons/io5";

const Control: FC<{ timeStamp: number; setTimeStamp: (seek: number) => void }> = ({ timeStamp, setTimeStamp }) => {
    const dispatch = useAppDispatch()
    const { position, playing, volume, playlist, shuffle, repeat, currentSongData, waitingForResponse } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    const currentSongChildren = playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.songs
    const previousBtn = useCallback(async () => {
        if (!currentSongChildren) return toast.error(i18next.t('playlist.empty'));
        const index = currentSongChildren.findIndex(song => song.id === currentSong?.id)
        const newPos = index === 0 ? currentSongChildren.length - 1 : index - 1
        if (currentSongChildren.length === 0) return toast.error(i18next.t('playlist.empty'))
        const newSoundData = currentSongChildren[newPos]
        if (newSoundData.id === currentSong?.id) return toast.error(i18next.t('playlist.no_more_songs'))
        dispatch(setPlaying(false))

        dispatch(handlePlay({
            position: newSoundData.id,
            soundData: newSoundData,
            volume,
            playlistId: currentSongData?.playlistId
        }))
    }, [position, currentSongChildren, volume, currentSongData])
    const nextBtn = useMemo(() => memoize((checkShuffle) => {
        if (!currentSongChildren) return toast.error(i18next.t('playlist.empty'));
        const index = currentSongChildren.findIndex(song => song.id === currentSong?.id)
        let newPos = index === currentSongChildren.length - 1 ? 0 : index + 1
        if (checkShuffle && shuffle && currentSongChildren.length > 2) {
            newPos = Math.floor(Math.random() * currentSongChildren.length)
            while (newPos === index) {
                newPos = Math.floor(Math.random() * currentSongChildren.length)
            }
        }
        if (currentSongChildren.length === 0) return toast.error(i18next.t('playlist.empty'))
        const newSoundData = currentSongChildren[newPos]
        if (newSoundData.id === currentSong?.id) return toast.error(i18next.t('playlist.no_more_songs'))
        dispatch(setPlaying(false))
        dispatch(handlePlay({
            position: newSoundData.id,
            soundData: newSoundData,
            volume: volume,
            playlistId: currentSongData?.playlistId
        }))
    }), [position, currentSongChildren, volume, currentSongData])
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => {
        setTimeStamp(time)
        const duration = currentSong?.duration ?? 0
        if (playing && duration && timeStamp === duration) {
            if (repeat) {
                setTimeStamp(0)
                fetchNui('seek', {
                    position: 0
                })
                return
            }
            if (currentSongChildren?.length === 0) return;
            nextBtn(true)
        }
    })
    useEffect(() => {
        if (position === -1) setTimeStamp(0);
    }, [position])
    return (
        <div className="flex gap-6 md:gap-4 items-center justify-center w-full mb-3">
            <div className="flex w-full items-center justify-center gap-1">
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                    onPress={() => dispatch(setRepeat(!repeat))}
                >
                    <IoRepeat size={24} className="text-foreground/80" color={repeat ? '#3b82f6' : '#fff'} />
                </Button>
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                    onPress={previousBtn}
                    isDisabled={waitingForResponse}
                >
                    <IoPlayBack size={24} />
                </Button>
                <Button
                    isIconOnly
                    className="w-auto h-auto data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                    onPress={() => position !== -1 && dispatch(setPlaying(!playing))}
                    isLoading={waitingForResponse}
                >
                    {playing ? (
                        <IoPauseCircle size={54} />
                    ) : (
                        <IoPlayCircle size={54} />
                    )}
                </Button>
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                    onPress={() => nextBtn(true)}
                    isDisabled={waitingForResponse}
                >
                    <IoPlayForward size={24} />
                </Button>
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10"
                    radius="full"
                    variant="light"
                    onPress={() => dispatch(setShuffle(!shuffle))}
                >
                    <IoShuffle size={24} className="text-foreground/80" color={shuffle ? '#3b82f6' : '#fff'} />
                </Button>
            </div>
        </div>
    )
}

export default memo(Control)