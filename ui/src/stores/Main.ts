import { handlePlay } from "@/thunks/handlePlay";
import { fetchNui } from "@/utils/fetchNui";
import { isEnvBrowser } from "@/utils/misc";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import i18next from 'i18next'
import playlist, { Playlist } from "@/fake-api/playlist-categories";
import { Song } from "@/fake-api/song";
import { Account, Settings } from "@/utils/types";

export interface StaticType {
    playing: boolean;
    currentSongData: { playlistId: string | number, song: Song } | undefined;
    position: string | number;
    playlist: typeof playlist;
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

const Static = createSlice({
    name: "Static",
    initialState: {
        playing: false,
        currentSongData: undefined,
        position: -1, // Current song id
        playlist: isEnvBrowser() ? playlist : [],
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
            fetchNui('togglePlay', {
                playing: action.payload
            })
        },
        setPlaylist: (state, action: PayloadAction<typeof playlist>) => {
            state.playlist = action.payload;
            if (!action.payload) return;
            state.currentSongs = state.playlist.find(playlist => playlist.id === state.currentPlaylistId)?.songs ?? undefined;
            if (state.editMode) return; // Block to save ui for not farewell to ui
            // fetchNui('setPlaylist', {
            //     playlist: action.payload
            // })
        },
        setCurrentPlaylistId: (state, action: PayloadAction<string | number>) => {
            state.currentPlaylistId = action.payload;
            state.currentSongs = state.playlist.find(playlist => playlist.id === action.payload)?.songs ?? undefined;
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
            fetchNui('setPlaylist', {
                playlist: state.playlist
            })
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
            const playlistId = state.currentPlaylistId;
            for (const playlist of state.playlist) {
                const song = playlist.songs.find(song => song.id === action.payload);
                if (!song) continue;
                fetchNui<number>('getCurrentSongDuration').then(res => {
                    state.currentSongs = playlist.songs;
                    song.duration = Math.floor(res);
                    state.currentSongData = { playlistId: playlistId, song };
                })
                break;
            }
        },
        setShuffle: (state, action: PayloadAction<boolean>) => {
            state.shuffle = action.payload;
        },
        setRepeat: (state, action: PayloadAction<boolean>) => {
            state.repeat = action.payload;
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
            if (!payload.response) return;
            const playlistId = payload.playlistId ?? state.currentPlaylistId;
            state.position = payload.position;

            if (payload.updatedSoundData) {
                const url = payload.updatedSoundData.url;
                state.playlist = state.playlist.map(playlist => {
                    if (playlist.id === playlistId) {
                        return {
                            ...playlist,
                            songs: playlist.songs.map(song => {
                                if (song.id === payload.position) {
                                    song.url = url;
                                    return song;
                                }
                                return song;
                            })
                        }
                    }
                    return playlist;
                })
                state.currentSongs = state.playlist.find(playlist => playlist.id === playlistId)?.songs ?? undefined;
                fetchNui('setPlaylist', {
                    playlist: state.playlist
                })
            }

            const playlist = state.playlist.find(playlist => playlist.id === playlistId);
            if (!playlist) return;

            const soundData = playlist.songs.find(song => song.id === payload.position);
            if (!soundData) return;

            state.currentSongData = { playlistId: playlistId, song: soundData };
            soundData.duration = Math.floor(payload.response);
            state.playing = true;
        })
        builder.addCase(handlePlay.rejected, (state, { payload }) => {
            state.waitingForResponse = false;
            toast.error(payload ?? i18next.t('general.something_went_wrong'))
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
    setUserData
} = Static.actions

export default Static.reducer