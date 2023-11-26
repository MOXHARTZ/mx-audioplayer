export const tracks = [
    {
        artwork_url: 'https://i1.sndcdn.com/artworks-000028045050-fl26i2-large.jpg',
        created_at: '2012-08-07T14:41:29Z',
        permalink_url: 'https://soundcloud.com/theneighbourhood/sweater-weather-1'
    }
] as Track[];

interface User {
    avatar_url: string;
    username: string;
}

export interface Track {
    id: string;
    user: User;
    artwork_url: string;
    title?: string;
    created_at: string;
    description?: string;
    permalink_url: string;
}