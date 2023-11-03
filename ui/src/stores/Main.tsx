import { playlist, Song } from "@/fake-api/song";
import { handlePlay } from "@/thunks/handlePlay";
import { fetchNui } from "@/utils/fetchNui";
import { IN_DEVELOPMENT } from "@/utils/misc";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

export interface StaticType {
    playing: boolean;
    position: number;
    playlist: Song[];
    editMode: boolean;
    selectedSongs: string[];
    volume: number;
    waitingForResponse: boolean;
    shuffle: boolean;
    repeat: boolean;
}

const Static = createSlice({
    name: "Static",
    initialState: {
        playing: false,
        position: -1, // Current song id
        playlist: IN_DEVELOPMENT ? playlist : [],
        editMode: false,
        selectedSongs: [],
        volume: 1,
        waitingForResponse: false,
        shuffle: false,
        repeat: false
    } as StaticType,
    reducers: {
        setPlaying: (state, action: PayloadAction<boolean>) => {
            state.playing = action.payload;
            fetchNui('togglePlay', {
                playing: action.payload
            })
        },
        setPlaylist: (state, action: PayloadAction<Song[]>) => {
            state.playlist = action.payload;
            fetchNui('setPlaylist', {
                playlist: action.payload
            })
        },
        setEditMode: (state, action: PayloadAction<boolean>) => {
            state.editMode = action.payload;
        },
        setSelectedSongs: (state, action: PayloadAction<string[]>) => {
            state.selectedSongs = action.payload;
        },
        clearSound: (state, action: PayloadAction<true | undefined>) => {
            state.playing = false;
            state.position = -1;
            if (action.payload) return; // If its true then dont send the nui event
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
        setPosition: (state, action: PayloadAction<number>) => {
            state.position = action.payload;
        },
        setShuffle: (state, action: PayloadAction<boolean>) => {
            state.shuffle = action.payload;
        },
        setRepeat: (state, action: PayloadAction<boolean>) => {
            state.repeat = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(handlePlay.fulfilled, (state, { payload }) => {
            state.waitingForResponse = false;
            if (!payload.response) return;
            const soundData = state.playlist[payload.position]
            if (!soundData) return;
            state.position = payload.position;
            soundData.duration = Math.floor(payload.response);
            state.playing = true;
        })
        builder.addCase(handlePlay.rejected, (state) => {
            state.waitingForResponse = false;
            toast.error('Something went wrong while playing the song');
        })
        builder.addCase(handlePlay.pending, (state) => {
            state.waitingForResponse = true;
        })

    }
})

export const {
    setPlaying,
    setPlaylist,
    setEditMode,
    setSelectedSongs,
    clearSound,
    setVolume,
    setWaitingForResponse,
    setPosition,
    setShuffle,
    setRepeat
} = Static.actions

export default Static.reducer