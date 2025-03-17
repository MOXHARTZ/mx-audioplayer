import { Action, ThunkAction } from '@reduxjs/toolkit';
import { setPlaying, StaticType } from '@/stores/Main';
import { toast } from "react-toastify";
import i18next from "i18next";
import { handlePlay } from './handlePlay';
import { RootState } from '@/stores';

export const nextSongThunk = (checkShuffle: boolean): AppThunk => (dispatch, getState) => {
    const state: StaticType = getState().Main;
    if (state.waitingForResponse) return;

    const currentSongChildren = state.playlist.find(playlist => playlist.id === state.currentSongData?.playlistId)?.songs
    if (!currentSongChildren) {
        toast.error(i18next.t('playlist.empty'));
        return
    }
    const index = currentSongChildren.findIndex(song => song.id === state.position)
    let newPos = index === currentSongChildren.length - 1 ? 0 : index + 1
    if (checkShuffle && state.shuffle && currentSongChildren.length > 2) {
        newPos = Math.floor(Math.random() * currentSongChildren.length)
        while (newPos === index) {
            newPos = Math.floor(Math.random() * currentSongChildren.length)
        }
    }
    if (currentSongChildren.length === 0) {
        toast.error(i18next.t('playlist.empty'))
        return
    }
    const newSoundData = currentSongChildren[newPos]
    if (newSoundData.id === state.position) {
        toast.error(i18next.t('playlist.no_more_songs'));
        return
    }
    dispatch(setPlaying(false))
    dispatch(handlePlay({
        position: newSoundData.id,
        soundData: newSoundData,
        volume: state.volume,
        playlistId: state.currentSongData?.playlistId
    }))
};

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
