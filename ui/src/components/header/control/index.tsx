import { FC, memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import useNuiEvent from '@/hooks/useNuiEvent';
import { setPlaying, setRepeat, setShuffle, setVolume } from '@/stores/Main';
import { handlePlay } from '@/thunks/handlePlay';
import { useAppDispatch, useAppSelector } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import i18next from 'i18next';
import { Button, Kbd, Tooltip } from "@heroui/react";
import { IoPauseCircle, IoPlayBack, IoPlayCircle, IoPlayForward, IoRepeat, IoShuffle } from "react-icons/io5";
import useKeyPress from '@/hooks/useKeyPress';
import { nextSongThunk } from '@/thunks/nextSong';
import { notification } from '@/utils/misc';

const Control: FC<{ timeStamp: number; setTimeStamp: (seek: number) => void }> = ({ timeStamp, setTimeStamp }) => {
    const dispatch = useAppDispatch()
    const { position, playing, volume, playlist, shuffle, repeat, currentSongData, waitingForResponse } = useAppSelector(state => state.Main)
    const currentSong = currentSongData?.song
    const playBtnEl = useRef<HTMLButtonElement>(null)
    const previousBtnEl = useRef<HTMLButtonElement>(null)
    const nextBtnEl = useRef<HTMLButtonElement>(null)
    const currentSongChildren = playlist.find(playlist => playlist.id === currentSongData?.playlistId)?.songs
    const previousBtnHandler = () => {
        previousBtnEl.current?.click()
        previousBtnEl.current?.blur() // Remove focus otherwise the keypress doesn't work
    }
    const nextBtnHandler = () => {
        nextBtnEl.current?.click()
        nextBtnEl.current?.blur() // Remove focus otherwise the keypress doesn't work
    }
    const playBtnHandler = () => {
        playBtnEl.current?.click()
        playBtnEl.current?.blur() // Remove focus otherwise the keypress doesn't work
    }
    useLayoutEffect(() => {
        fetchNui<number>('getCurrentSongTimeStamp').then((time) => {
            setTimeStamp(time)
        })
    }, [])
    const previousBtn = useCallback(async () => {
        if (waitingForResponse) return;
        if (!currentSongChildren) return notification(i18next.t('playlist.empty'), 'error');
        const index = currentSongChildren.findIndex(song => song.id === currentSong?.id)
        const newPos = index === 0 ? currentSongChildren.length - 1 : index - 1
        if (currentSongChildren.length === 0) return notification(i18next.t('playlist.empty'), 'error')
        const newSoundData = currentSongChildren[newPos]
        if (newSoundData.id === currentSong?.id) return notification(i18next.t('playlist.no_more_songs'), 'error')
        dispatch(setPlaying(false))

        dispatch(handlePlay({
            position: newSoundData.id,
            soundData: newSoundData,
            volume,
            playlistId: currentSongData?.playlistId
        }))
    }, [position, currentSongChildren, volume, currentSongData, waitingForResponse])
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => {
        setTimeStamp(time)
    })
    const updateVolume = useCallback((newValue: number) => {
        if (newValue < 0 || newValue > 1) return;
        dispatch(setVolume(newValue as number));
        fetchNui('setVolume', { volume: newValue as number })
    }, []);
    useEffect(() => {
        if (position === -1) setTimeStamp(0);
    }, [position])
    useKeyPress('ArrowLeft', true, previousBtnHandler)
    useKeyPress('ArrowRight', true, nextBtnHandler)
    useKeyPress('ArrowUp', true, () => updateVolume(volume - 0.1))
    useKeyPress('ArrowDown', true, () => updateVolume(volume - 0.1))
    useKeyPress('K', true, playBtnHandler)
    useNuiEvent('nextSong', nextBtnHandler)
    useNuiEvent('previousSong', previousBtnHandler)
    useNuiEvent('togglePlay', playBtnHandler)
    useNuiEvent('volumeUp', () => updateVolume(volume + 0.1))
    useNuiEvent('volumeDown', () => updateVolume(volume - 0.1))
    return (
        <div className="flex gap-6 md:gap-4 items-center justify-center w-full mb-3">
            <div className="flex w-full items-center justify-center gap-1">
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 transition-all duration-300 ease-out hover:scale-110 hover:rotate-12 active:scale-95"
                    radius="full"
                    variant="light"
                    onPress={() => dispatch(setRepeat(!repeat))}
                >
                    <IoRepeat
                        size={24}
                        className={`text-foreground/80 transition-all duration-500 ease-in-out ${repeat ? 'text-blue-500 scale-110 rotate-180' : 'text-white'
                            }`}
                    />
                </Button>
                <Tooltip content={<Kbd keys={["shift", "left"]}></Kbd>}>
                    <Button
                        isIconOnly
                        className="data-[hover]:bg-foreground/10 transition-all duration-300 ease-out hover:scale-110 hover:-translate-x-1 active:scale-95"
                        radius="full"
                        variant="light"
                        onPress={previousBtn}
                        isDisabled={waitingForResponse}
                        ref={previousBtnEl}
                    >
                        <IoPlayBack size={24} className="transition-transform duration-200 hover:scale-110" />
                    </Button>
                </Tooltip>
                <Tooltip content={<Kbd keys={["shift"]}>K</Kbd>}>
                    <Button
                        isIconOnly
                        className="w-auto h-auto data-[hover]:bg-foreground/10 transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                        radius="full"
                        variant="light"
                        onPress={() => !waitingForResponse && position !== -1 && dispatch(setPlaying(!playing))}
                        isLoading={waitingForResponse}
                        ref={playBtnEl}
                    >
                        <div className="relative">
                            {playing ? (
                                <IoPauseCircle
                                    size={54}
                                    className="transition-all duration-500 ease-in-out"
                                />
                            ) : (
                                <IoPlayCircle
                                    size={54}
                                    className="transition-all duration-500 ease-in-out"
                                />
                            )}
                        </div>
                    </Button>
                </Tooltip>
                <Tooltip content={<Kbd keys={["shift", "right"]}></Kbd>}>
                    <Button
                        isIconOnly
                        className="data-[hover]:bg-foreground/10 transition-all duration-300 ease-out hover:scale-110 hover:translate-x-1 active:scale-95"
                        radius="full"
                        variant="light"
                        onPress={() => dispatch(nextSongThunk(true))}
                        isDisabled={waitingForResponse}
                        ref={nextBtnEl}
                    >
                        <IoPlayForward size={24} className="transition-transform duration-200 hover:scale-110" />
                    </Button>
                </Tooltip>
                <Button
                    isIconOnly
                    className="data-[hover]:bg-foreground/10 transition-all duration-300 ease-out hover:scale-110 hover:rotate-12 active:scale-95"
                    radius="full"
                    variant="light"
                    onPress={() => dispatch(setShuffle(!shuffle))}
                >
                    <IoShuffle
                        size={24}
                        className={`text-foreground/80 transition-all duration-500 ease-in-out ${shuffle ? 'text-blue-500 scale-110 rotate-180' : 'text-white'
                            }`}
                    />
                </Button>
            </div>
        </div>
    )
}

export default memo(Control)