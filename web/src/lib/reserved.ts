export const LIKED_ID = '__liked';
export const RECENT_ID = '__recent';
export const RADIO_ID = '__radio';

export const RECENT_LIMIT = 30;

export const isReservedPlaylist = (id: string | number | undefined): boolean =>
    id === LIKED_ID || id === RECENT_ID || id === RADIO_ID;

export const PINNED_IDS: string[] = [LIKED_ID, RECENT_ID];
