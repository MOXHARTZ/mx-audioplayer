export interface Song {
    id: string;
    soundId: string;
    title: string;
    artist: string;
    cover: string;
    url?: string;
    duration: number;
    isStream?: boolean;
}

export interface Playlist {
    id: string | number;
    name: string;
    songs: Song[];
    thumbnail?: string;
    description?: string;
}

export interface LuaPlayer {
    queue?: QueueEntry[];
    id?: string;
    soundId?: string;
    source?: number;
    soundData?: Song;
    playing?: boolean;
    duration?: number;
    volume?: number;
    repeatState?: boolean;
    shuffle?: boolean;
    currentPlaylistId?: string | number;
}

export interface Account {
    id?: number;
    username: string;
    password?: string;
    firstname: string;
    lastname: string;
    avatar?: string;
    isOwner: boolean;
}

export interface GtaPlayer {
    name: string;
    source: number | string;
    distance?: number;
}

export type MinimalHudPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Settings {
    minimalHud: boolean;
    minimalHudPosition?: MinimalHudPosition;
    fadeIn?: number;
    fadeOut?: number;
}

export interface RadioStation {
    id: string;
    title: string;
    artist: string;
    cover: string;
    url: string;
}

export interface QueueEntry {
    uid: string;
    song: Song;
    playlistId: string | number;
}

export interface ReadyListener {
    languageName: string;
    resources: Record<string, { translation: Record<string, unknown> }>;
    settings: Settings;
    stations?: RadioStation[];
    fade?: { enable: boolean; in: number; out: number; allowPlayerOverride: boolean };
}

export interface Track {
    id: string;
    name: string;
    url?: string;
    videoId?: string;
    artist?: { name: string };
    artists?: { name: string }[];
    thumbnails: { url: string; width?: number; height?: number }[];
}

export type QueryResult = { error: string; code: number } | Track[];

export interface OpenPayload {
    playlist: Playlist[] | null;
    currentSound?: Song;
    user?: Account;
    player: LuaPlayer;
    accounts?: Account[];
}

export type ToastType = 'info' | 'error' | 'success';
