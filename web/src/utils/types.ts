import { Track } from "@/fake-api/search-results";
import { Song } from "@/fake-api/song";

export type QueryResult = Error | Track[]
export interface Error {
    error: string;
    code: number;
}

export type ReadyListener = {
    languageName: string;
    resources: Record<string, Record<string, string>>;
    settings: Settings;
}

export type Player = {
    id: string;
    soundId: string;
    source: number;
    soundData: Song;
    playing: boolean;
    duration: number;
    volume: number;
    repeatState: boolean;
    shuffle: boolean;
    currentPlaylistId: string;
}

export type GtaPlayer = {
    name: string;
    source: number;
}

export type MinimalHudPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type Settings = {
    minimalHud: boolean;
    minimalHudPosition?: MinimalHudPosition;
}

export type Account = {
    id?: number; // You can't access if you are not owner of the account
    username: string;
    password?: string; // You can't access if you are not owner of the account
    firstname: string;
    lastname: string;
    avatar?: string;
    isOwner: boolean
}

export type Playlist = {
    id: string | number;
    name: string
    songs: Song[];
    thumbnail?: string;
    description?: string;
}
