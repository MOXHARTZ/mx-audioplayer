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
    }
] as Song[];

export interface Song {
    id: string;
    soundId: string;
    title: string;
    artist: string;
    cover: string;
    url: string;
    duration: number;
}