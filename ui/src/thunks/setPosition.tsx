import { Action, ThunkAction } from '@reduxjs/toolkit';
import { setCurrentSongData, setCurrentSongs, setPlaying, setPosition, StaticType } from '@/stores/Main';
import { RootState } from '@/stores';
import { fetchNui } from '@/utils/fetchNui';
import { Song } from '@/fake-api/song';

export const setPositionThunk = (sound: Song): AppThunk => (dispatch, getState) => {
    const state: StaticType = getState().Main;
    dispatch(setPosition(sound.id));
    const playlistId = state.currentPlaylistId;
    for (const playlist of state.playlist) {
        let song = playlist.songs.find(song => song.id === sound.id);
        if (!song) continue;
        fetchNui<number>('getCurrentSongDuration').then(res => {
            dispatch(setCurrentSongs(playlist.songs));
            dispatch(setPlaying(sound.playing ?? false));
            dispatch(setCurrentSongData({
                playlistId, song: {
                    ...sound,
                    duration: Math.floor(res)

                }
            }));
        })
        break;
    }
};

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
