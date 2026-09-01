export { default as cn } from 'classnames';

const NANOID_ALPHABET = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';

export function nanoid(size = 21): string {
    let id = '';
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    for (let i = 0; i < size; i++) {
        id += NANOID_ALPHABET[bytes[i] & 61];
    }
    return id;
}

export const formatDuration = (value: number) => {
    const safe = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    const minute = Math.floor(safe / 60);
    const second = safe - minute * 60;
    return `${minute}:${second < 10 ? `0${second}` : second}`;
};

export const isEmpty = (value: unknown): boolean => {
    if (!value) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && Object.keys(value as object).length === 0) return true;
    return false;
};

export const isUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const validQueryDomains = new Set([
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'gaming.youtube.com',
]);

export const getYoutubePlaylistID = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        if (!validQueryDomains.has(parsed.hostname)) return null;
        return parsed.searchParams.get('list');
    } catch {
        return null;
    }
};

export const isSpotifyPlaylist = (url: string) =>
    /^(https:\/\/open\.spotify\.com\/playlist\/)([a-zA-Z0-9]+)(.*)$/.test(url);

export const isSpotifyAlbum = (url: string) =>
    /^(https:\/\/open\.spotify\.com\/album\/)([a-zA-Z0-9]+)(.*)$/.test(url);

export const YOUTUBE_URL = 'https://www.youtube.com/watch?v=';

export const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export const includesFold = (value: unknown, term: string): boolean =>
    typeof value === 'string' && value.toLowerCase().includes(term);

export const matchesSong = (song: { title?: unknown; artist?: unknown }, term: string): boolean =>
    includesFold(song.title, term) || includesFold(song.artist, term);
