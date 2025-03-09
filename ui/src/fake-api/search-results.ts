export const tracks = [
    {
        "videoId": "uH4LEFIZADQ",
        "name": "Crossfire",
        "artists": [
            {
                "artistId": "UC-pWHpBjdGG69N9mM2auIAA",
                "name": "Stephen"
            }
        ],
        "album": {
            "albumId": "MPREb_vMP5uqrGYFb",
            "name": "Sincerely"
        },
        "thumbnails": [
            {
                "url": "https://lh3.googleusercontent.com/meMq0NRNEUnR2bXYpAKXG0TGn3sgjWQs-UWqltsL2sEr6T_kI8xAeOY0leE6fo4XmLu3tMQXEmfXTMUQ=w60-h60-l90-rj",
                "width": 60,
                "height": 60
            },
            {
                "url": "https://lh3.googleusercontent.com/meMq0NRNEUnR2bXYpAKXG0TGn3sgjWQs-UWqltsL2sEr6T_kI8xAeOY0leE6fo4XmLu3tMQXEmfXTMUQ=w120-h120-l90-rj",
                "width": 120,
                "height": 120
            }
        ]
    },
    {
        "videoId": "tvAcYbQ9bzM",
        "name": "Crossfire",
        "artists": [
            {
                "artistId": "UC-pWHpBjdGG69N9mM2auIAA",
                "name": "Stephen"
            }
        ],
        "album": {
            "albumId": "MPREb_uBUj3uXsOr5",
            "name": "Crossfire"
        },
        "duration": 270,
        "thumbnails": [
            {
                "url": "https://lh3.googleusercontent.com/ZxTjpnHfLhXOgLncYxfi9mf79QU5CGuGPxP6MidWL4b2x5w6ADJEFBjseZNxhH9TlbJzBJnQOmw4HqmEhg=w60-h60-l90-rj",
                "width": 60,
                "height": 60
            },
            {
                "url": "https://lh3.googleusercontent.com/ZxTjpnHfLhXOgLncYxfi9mf79QU5CGuGPxP6MidWL4b2x5w6ADJEFBjseZNxhH9TlbJzBJnQOmw4HqmEhg=w120-h120-l90-rj",
                "width": 120,
                "height": 120
            }
        ]
    }
] as Track[];

interface Artist {
    artistId: string;
    name: string;
}

interface Album {
    albumId: string;
    name: string;
}

interface Thumbnail {
    url: string;
    width: number;
    height: number;
}

export interface Track {
    id: string;
    artists: Artist[];
    artist?: Artist;
    videoId?: string;
    url?: string;
    name: string;
    album?: Album;
    thumbnails: Thumbnail[];
}