export const playlist = [
    {
        id: '1',
        soundId: '1',
        title: 'Song 1',
        artist: 'Artist 1',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/sweeetsour/rebuke-anyma-syren-extended-mix-afterlife?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 100
    },
    {
        id: '2',
        soundId: '2',
        title: 'Song 2',
        artist: 'Artist 2',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '3',
        soundId: '3',
        title: 'Song 3',
        artist: 'Artist 3',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '4',
        soundId: '4',
        title: 'Song 4',
        artist: 'Artist 4',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '5',
        soundId: '5',
        title: 'Song 5',
        artist: 'Artist 5',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '6',
        soundId: '6',
        title: 'Song 6',
        artist: 'Artist 6',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '7',
        soundId: '7',
        title: 'Song 7',
        artist: 'Artist 7',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '8',
        soundId: '8',
        title: 'Song 8',
        artist: 'Artist 8',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '9',
        soundId: '9',
        title: 'Song 9',
        artist: 'Artist 9',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '10',
        soundId: '10',
        title: 'Song 10',
        artist: 'Artist 10',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
    {
        id: '11',
        soundId: '11',
        title: 'Song 11',
        artist: 'Artist 11',
        cover: 'https://picsum.photos/200/300',
        url: 'https://soundcloud.com/autografmusic/autograf-burko-voodoo?in=sc-playlists/sets/techno-chill&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing',
        duration: 300
    },
] as Song[];

export interface Song {
    id: string;
    soundId: string;
    title: string;
    artist: string;
    cover: string;
    url: string;
    duration: number;
    playing?: boolean;
}