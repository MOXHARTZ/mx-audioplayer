import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ContextMenuType = {
    playlistModalVisible: boolean;
}

const ContextMenuSlice = createSlice({
    name: "ContextMenu",
    initialState: {
        playlistModalVisible: false,
    } as ContextMenuType,
    reducers: {
        setPlaylistModalVisible: (state, action: PayloadAction<boolean>) => {
            state.playlistModalVisible = action.payload;
        }
    }
})

export const { setPlaylistModalVisible } = ContextMenuSlice.actions

export default ContextMenuSlice.reducer