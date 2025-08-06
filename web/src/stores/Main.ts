import { handlePlay } from "@/thunks/handlePlay";
import { fetchNui } from "@/utils/fetchNui";
import { isEnvBrowser, notification } from "@/utils/misc";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import i18next from 'i18next'
import { Song } from "@/fake-api/song";
import { Account, Playlist, Settings } from "@/utils/types";

export interface StaticType {
    playing: boolean;
    currentSongData: { playlistId: string | number, song: Song } | undefined;
    position: string | number;
    playlist: Playlist[];
    currentPlaylistId: number | string;
    currentSongs: Song[] | undefined;
    editMode: boolean;
    selectedSongs: string[];
    volume: number;
    waitingForResponse: boolean;
    shuffle: boolean;
    repeat: boolean;
    filterPlaylist: string;
    settings: Settings;
    userData?: Account | undefined;
}

// the shittiest code I've ever written in my life, but you know what? it works so fuck it.

const Static = createSlice({
    name: "Static",
    initialState: {
        playing: false,
        currentSongData: undefined,
        position: -1, // Current song id
        playlist: [],
        currentPlaylistId: -1,
        currentSongs: undefined,
        editMode: false,
        selectedSongs: [],
        volume: 1,
        waitingForResponse: false,
        shuffle: false,
        repeat: false,
        filterPlaylist: '',
        settings: {
            minimalHud: false
        }
    } as StaticType,
    reducers: {
        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.playing = action.payload;
            fetchNui('togglePlay', action.payload)
        },
        setPlaylist: (state, action: PayloadAction<Playlist[]>) => {
            state.playlist = action.payload;
            if (!action.payload || !state.playlist) return;
            state.currentSongs = state.playlist.find(playlist => playlist.id === state.currentPlaylistId)?.songs ?? undefined;
        },
        setCurrentPlaylistId: (state, action: PayloadAction<string | number>) => {
            state.currentPlaylistId = action.payload;
            state.currentSongs = state?.playlist?.find?.(playlist => playlist.id === action.payload)?.songs ?? undefined;
        },
        setCurrentSongs: (state, action: PayloadAction<Song[]>) => {
            state.playlist = state.playlist.map(playlist => {
                if (playlist.id === state.currentPlaylistId) {
                    return {
                        ...playlist,
                        songs: action.payload
                    }
                }
                return playlist
            })
            state.currentSongs = action.payload;
            if (state.editMode) return;
            fetchNui('setPlaylist', {
                playlist: state.playlist
            })
        },
        updateCurrentSongs: (state, action: PayloadAction<Song[]>) => {
            state.currentSongs = action.payload;
        },
        setEditMode: (state, action: PayloadAction<boolean>) => {
            state.editMode = action.payload;
            if (!state.editMode) {
                fetchNui('setPlaylist', {
                    playlist: state.playlist
                })
            }
        },
        deletePlaylist: (state, action: PayloadAction<number | string>) => {
            state.playlist = state.playlist.filter(playlist => playlist.id !== action.payload);
            if (state.currentPlaylistId === action.payload) {
                state.currentPlaylistId = -1;
                state.currentSongs = undefined;
                state.playing = false;
                state.position = -1;
                fetchNui('togglePlay', {
                    playing: false
                })
            }
            fetchNui('setPlaylist', {
                playlist: state.playlist
            })
        },
        addPlaylist: (state, action: PayloadAction<Playlist>) => {
            state.playlist.push(action.payload);
            fetchNui('setPlaylist', {
                playlist: state.playlist
            })
        },
        updatePlaylist: (state, action: PayloadAction<Playlist>) => {
            state.playlist = state.playlist.map(playlist => {
                if (playlist.id === action.payload.id) {
                    return action.payload;
                }
                return playlist;
            })
            fetchNui('setPlaylist', {
                playlist: state.playlist
            })
        },
        setSelectedSongs: (state, action: PayloadAction<string[]>) => {
            state.selectedSongs = action.payload;
        },
        setCurrentSongData: (state, action: PayloadAction<{ playlistId: string | number, song: Song } | undefined>) => {
            state.currentSongData = action.payload;
        },
        clearSound: (state, action: PayloadAction<true | undefined>) => {
            state.playing = false;
            state.position = -1;
            state.currentSongData = undefined;
            if (action.payload) return;
            fetchNui('togglePlay', {
                playing: false
            })
        },
        setVolume: (state, action: PayloadAction<number>) => {
            state.volume = action.payload;
        },
        setWaitingForResponse: (state, action: PayloadAction<boolean>) => {
            state.waitingForResponse = action.payload;
        },
        setPosition: (state, action: PayloadAction<string>) => {
            state.position = action.payload;
        },
        setShuffle: (state, action: PayloadAction<boolean>) => {
            state.shuffle = action.payload;
            fetchNui('setShuffle', action.payload)
        },
        setRepeat: (state, action: PayloadAction<boolean>) => {
            state.repeat = action.payload;
            fetchNui('setRepeat', action.payload)
        },
        setFilterPlaylist: (state, action: PayloadAction<string>) => {
            state.filterPlaylist = action.payload;
        },
        setSettings: (state, action: PayloadAction<Settings>) => {
            state.settings = action.payload;
        },
        setUserData: (state, action: PayloadAction<Account | undefined>) => {
            state.userData = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(handlePlay.fulfilled, (state, { payload }) => {
            state.waitingForResponse = false;
        })
        builder.addCase(handlePlay.rejected, (state, { payload }) => {
            state.waitingForResponse = false;
            notification((payload ?? i18next.t('general.something_went_wrong') as any), 'error');
        })
        builder.addCase(handlePlay.pending, (state) => {
            state.waitingForResponse = true;
        })

    }
})

export const {
    setPlaying,
    setPlaylist,
    setCurrentPlaylistId,
    setEditMode,
    setSelectedSongs,
    clearSound,
    setVolume,
    setWaitingForResponse,
    setPosition,
    setShuffle,
    setRepeat,
    setFilterPlaylist,
    setCurrentSongs,
    deletePlaylist,
    addPlaylist,
    updatePlaylist,
    setSettings,
    setUserData,
    setCurrentSongData,
    updateCurrentSongs
} = Static.actions

export default Static.reducer