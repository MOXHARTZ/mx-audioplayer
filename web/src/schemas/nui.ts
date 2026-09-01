import { z } from 'zod';

const text = (fallback = '') =>
    z.any().optional().transform((value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return String(value);
        return fallback;
    });

const nonNegativeNumber = (fallback = 0) =>
    z.any().optional().transform((value) => {
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    });

const optionalText = z.any().optional().transform((value) =>
    typeof value === 'string' && value.length > 0 ? value : undefined,
);

const boolish = z.any().optional().transform((value) => value === true);

export const songSchema = z.object({
    id: text(),
    soundId: text(),
    title: text('Unknown'),
    artist: text('Unknown'),
    cover: text(),
    url: optionalText,
    duration: nonNegativeNumber(),
    isStream: boolish,
}).transform((song) => ({
    ...song,
    id: song.id || song.soundId || song.url || song.title,
    soundId: song.soundId || song.id,
}));

export const songListSchema = z.array(z.any()).transform((songs) =>
    songs
        .map(song => songSchema.safeParse(song))
        .filter(result => result.success)
        .map(result => result.data),
);

export const playlistSchema = z.object({
    id: z.union([z.string(), z.number()]).catch(''),
    name: text('Untitled'),
    description: optionalText,
    thumbnail: optionalText,
    songs: songListSchema.catch([]),
});

export const playlistListSchema = z.array(z.any()).transform((playlists) =>
    playlists
        .map(playlist => playlistSchema.safeParse(playlist))
        .filter(result => result.success)
        .map(result => result.data)
        .filter(playlist => playlist.id !== ''),
);

export const queueEntrySchema = z.object({
    uid: text(),
    song: songSchema,
    playlistId: z.union([z.string(), z.number()]).catch(''),
});

export const queueSchema = z.array(z.any()).transform((entries) =>
    entries
        .map(entry => queueEntrySchema.safeParse(entry))
        .filter(result => result.success)
        .map(result => result.data)
        .filter(entry => entry.uid !== ''),
);

export const stationSchema = z.object({
    id: text(),
    title: text('Radio'),
    artist: text(''),
    cover: text(),
    url: text(),
});

export const stationListSchema = z.array(z.any()).transform((stations) =>
    stations
        .map(station => stationSchema.safeParse(station))
        .filter(result => result.success)
        .map(result => result.data)
        .filter(station => station.id !== '' && station.url !== ''),
);

export const luaPlayerSchema = z.object({
    id: optionalText,
    soundId: optionalText,
    soundData: songSchema.optional().catch(undefined),
    playing: z.boolean().optional().catch(undefined),
    duration: nonNegativeNumber(),
    volume: z.number().min(0).max(1).optional().catch(undefined),
    repeatState: z.boolean().optional().catch(undefined),
    shuffle: z.boolean().optional().catch(undefined),
    currentPlaylistId: z.union([z.string(), z.number()]).optional().catch(undefined),
    queue: queueSchema.catch([]),
}).catch({ duration: 0, queue: [] } as never);

export const openPayloadSchema = z.object({
    playlist: playlistListSchema.nullable().catch(null),
    currentSound: songSchema.optional().catch(undefined),
    user: z.object({
        id: z.number().optional().catch(undefined),
        username: text(),
        firstname: text(),
        lastname: text(),
        avatar: optionalText,
        isOwner: boolish,
    }).optional().catch(undefined),
    player: luaPlayerSchema,
    accounts: z.array(z.object({
        id: z.number().optional().catch(undefined),
        username: text(),
        firstname: text(),
        lastname: text(),
        avatar: optionalText,
        isOwner: boolish,
    })).catch([]),
});

const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export const settingsSchema = z.object({
    minimalHud: z.boolean().catch(false),
    minimalHudPosition: z.enum(positions).optional().catch(undefined),
    fadeIn: z.number().min(0).max(8).optional().catch(undefined),
    fadeOut: z.number().min(0).max(8).optional().catch(undefined),
}).catch({ minimalHud: false } as never);

export const readyPayloadSchema = z.object({
    languageName: text('en'),
    resources: z.record(z.string(), z.any()).catch({}),
    settings: settingsSchema,
    stations: stationListSchema.catch([]),
    stationsPlaylistId: text('__radio'),
    fade: z.object({
        enable: z.boolean().catch(true),
        in: z.number().catch(1.5),
        out: z.number().catch(1.5),
        allowPlayerOverride: z.boolean().catch(true),
    }).optional().catch(undefined),
});

export const nearbyPlayersSchema = z.array(z.object({
    name: text('Unknown'),
    source: z.union([z.string(), z.number()]),
    distance: z.number().optional().catch(undefined),
})).catch([]);

export type ParsedSong = z.infer<typeof songSchema>;
export type ParsedPlaylist = z.infer<typeof playlistSchema>;
