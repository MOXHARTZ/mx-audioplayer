import { Songs } from "./song"

const playlist = [
    {
        id: 1,
        name: '2010s',
        songs: Songs
    },
    {
        id: 2,
        name: '2000s',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 3,
        name: 'Chill',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 4,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 5,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 6,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 7,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 8,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 9,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
    {
        id: 10,
        name: 'Rap',
        songs: [],
        thumbnail: 'https://random.imagecdn.app/600/600'
    },
] as Playlist[];

export type Playlist = {
    id: string | number;
    name: string
    songs: typeof Songs;
    thumbnail?: string;
    description?: string;
}

export default playlist