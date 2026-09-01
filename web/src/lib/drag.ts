import type { Song } from '@/types';

export const SONG_DRAG_TYPE = 'application/x-qs-song';

export interface SongDragPayload {
    song: Song;
    fromPlaylistId: string | number;
}

export const writeSongDrag = (dataTransfer: DataTransfer, payload: SongDragPayload) => {
    dataTransfer.setData(SONG_DRAG_TYPE, JSON.stringify(payload));
    dataTransfer.effectAllowed = 'copy';
};

export const readSongDrag = (dataTransfer: DataTransfer): SongDragPayload | null => {
    const raw = dataTransfer.getData(SONG_DRAG_TYPE);
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as SongDragPayload;
        return parsed?.song?.id ? parsed : null;
    } catch {
        return null;
    }
};
