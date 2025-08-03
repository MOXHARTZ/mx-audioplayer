import { Action, ThunkAction } from '@reduxjs/toolkit';
import { setPlaying, StaticType } from '@/stores/Main';
import i18next from "i18next";
import { handlePlay } from './handlePlay';
import { RootState } from '@/stores';
import { notification } from '@/utils/misc';
import type { Playlist } from '@/utils/types';
import { Song } from '@/fake-api/song';

export const nextSongThunk = (checkShuffle: boolean, playlist?: Playlist, position?: number | string): AppThunk => (dispatch, getState) => {
    const state: StaticType = getState().Main;
    if (state.waitingForResponse) return;
    let currentSongChildren: Song[]
    position = position || state.position

    if (playlist) {
        currentSongChildren = playlist.songs
    } else {
        currentSongChildren = state.playlist.find(playlist => playlist.id === state.currentSongData?.playlistId)?.songs ?? []
    }
    if (!currentSongChildren) {
        notification(i18next.t('playlist.empty'), 'error')
        return
    }
    const index = currentSongChildren.findIndex(song => song.id === position)
    let newPos = index === currentSongChildren.length - 1 ? 0 : index + 1
    if (checkShuffle && state.shuffle && currentSongChildren.length > 2) {
        newPos = Math.floor(Math.random() * currentSongChildren.length)
        while (newPos === index) {
            newPos = Math.floor(Math.random() * currentSongChildren.length)
        }
    }
    if (currentSongChildren.length === 0) {
        notification(i18next.t('playlist.empty'), 'error')
        return
    }
    const newSoundData = currentSongChildren[newPos]
    if (newSoundData.id === position) {
        notification(i18next.t('playlist.no_more_songs'), 'error')
        return
    }

    dispatch(setPlaying(false))
    dispatch(handlePlay({
        position: newSoundData.id,
        soundData: newSoundData,
        volume: state.volume,
        playlistId: playlist?.id
    }))
};

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
