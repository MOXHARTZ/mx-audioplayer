import { debugData } from './nui';
import type { OpenPayload, Song } from '@/types';

const song = (i: number, title: string, artist: string): Song => ({
    id: `song-${i}`,
    soundId: `sound-${i}`,
    title,
    artist,
    cover: `https://picsum.photos/seed/cover-${i}/200/200`,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 120 + i * 17,
});

const songs = [
    song(1, 'Neon Overpass', 'Vail Renner'),
    song(2, 'Static Bloom', 'Kova'),
    song(3, 'Midnight Freight', 'Ash Corrin'),
    song(4, 'Paper Lanterns', 'Mirelle Fox'),
    song(5, 'Slow Exit', 'Dune Harlow'),
    song(6, 'Copper Sky', 'The Ivory Set'),
    song(7, 'Shoreditch', 'Prompto'),
    song(8, 'Held Together', 'KNSRK'),
];

const payload: OpenPayload = {
    playlist: [
        {
            id: 'pl-1',
            name: 'Night Drive',
            description: 'Late drive set',
            songs,
        },
        {
            id: 'pl-2',
            name: 'Garage',
            songs: songs.slice(0, 3),
        },
        {
            id: 'pl-3',
            name: 'Empty One',
            songs: [],
        },
    ],
    currentSound: songs[0],
    user: {
        username: 'moxha',
        firstname: 'Mox',
        lastname: 'Ha',
        isOwner: true,
    },
    player: {
        playing: true,
        volume: 0.8,
        currentPlaylistId: 'pl-1',
        repeatState: false,
        shuffle: false,
        duration: songs[0].duration,
        queue: [
            { uid: 'q1', song: songs[3], playlistId: 'pl-1' },
            { uid: 'q2', song: songs[5], playlistId: 'pl-1' },
        ],
    },
    accounts: [
        { id: 1, username: 'moxha', firstname: 'Mox', lastname: 'Ha', isOwner: true },
        { id: 2, username: 'dj-ayla', firstname: 'Ayla', lastname: 'Vural', isOwner: true },
    ],
};

debugData([
    {
        action: 'onUiReady',
        data: {
            languageName: 'en',
            resources: { en: { translation: (await import('../../../locales/en.json')).default } },
            settings: { minimalHud: true, minimalHudPosition: 'bottom-right' },
            fade: { enable: true, in: 1.5, out: 1.5, allowPlayerOverride: true },
            stations: [
                { id: 'lofi_beats', title: 'Lofi Beats', artist: 'Chill / Study', cover: 'https://picsum.photos/seed/lofi_beats/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'lofi_sleep', title: 'Sleepy Lofi', artist: 'Slow / Night', cover: 'https://picsum.photos/seed/lofi_sleep/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'synthwave', title: 'Synthwave', artist: 'Retro / Drive', cover: 'https://picsum.photos/seed/synthwave/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'chillhop', title: 'Chillhop', artist: 'Jazzy / Lofi', cover: 'https://picsum.photos/seed/chillhop/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'jazz', title: 'Jazz Lounge', artist: 'Smooth / Evening', cover: 'https://picsum.photos/seed/jazz/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'deep_house', title: 'Deep House', artist: 'Club / Late', cover: 'https://picsum.photos/seed/deep_house/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'phonk', title: 'Phonk', artist: 'Drift / Hard', cover: 'https://picsum.photos/seed/phonk/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'dnb', title: 'Drum and Bass', artist: 'Fast / Heavy', cover: 'https://picsum.photos/seed/dnb/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'hiphop', title: 'Hip Hop', artist: 'Rap / Beats', cover: 'https://picsum.photos/seed/hiphop/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'rock', title: 'Rock Classics', artist: 'Guitars / Loud', cover: 'https://picsum.photos/seed/rock/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'ambient', title: 'Ambient', artist: 'Space / Calm', cover: 'https://picsum.photos/seed/ambient/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'anime_lofi', title: 'Anime Lofi', artist: 'Soft / Study', cover: 'https://picsum.photos/seed/anime_lofi/300/300', url: 'https://www.youtube.com/watch?v=mock' },
                { id: 'gaming', title: 'Gaming Mix', artist: 'EDM / Energy', cover: 'https://picsum.photos/seed/gaming/300/300', url: 'https://www.youtube.com/watch?v=mock' },
            ],
        },
    },
], 100);

debugData([
    { action: 'open', data: payload },
], 300);
