import { describe, expect, it } from 'vitest';
import {
    openPayloadSchema, playlistListSchema, queueSchema, readyPayloadSchema,
    settingsSchema, songSchema, stationListSchema,
} from './nui';

describe('songSchema', () => {
    it('fills in a missing artist instead of rejecting the song', () => {
        const parsed = songSchema.parse({ id: 'a', soundId: 'a', title: 'Track' });
        expect(parsed.artist).toBe('Unknown');
        expect(parsed.title).toBe('Track');
    });

    it('falls back to soundId when the id is missing', () => {
        const parsed = songSchema.parse({ soundId: 'sound-1', title: 'x', artist: 'y' });
        expect(parsed.id).toBe('sound-1');
    });

    it('falls back to the title when both ids are missing', () => {
        const parsed = songSchema.parse({ title: 'Orphan' });
        expect(parsed.id).toBe('Orphan');
    });

    it('coerces a numeric title to a string', () => {
        const parsed = songSchema.parse({ id: 'a', soundId: 'a', title: 2024, artist: null });
        expect(parsed.title).toBe('2024');
        expect(parsed.artist).toBe('Unknown');
    });

    it('rejects a negative or non-numeric duration down to zero', () => {
        expect(songSchema.parse({ id: 'a', duration: -5 }).duration).toBe(0);
        expect(songSchema.parse({ id: 'a', duration: 'abc' }).duration).toBe(0);
        expect(songSchema.parse({ id: 'a', duration: 180 }).duration).toBe(180);
    });

    it('treats isStream as strictly boolean', () => {
        expect(songSchema.parse({ id: 'a', isStream: 'yes' }).isStream).toBe(false);
        expect(songSchema.parse({ id: 'a', isStream: true }).isStream).toBe(true);
    });
});

describe('playlistListSchema', () => {
    it('keeps good playlists and drops the ones with no id', () => {
        const parsed = playlistListSchema.parse([
            { id: 'pl-1', name: 'Keep', songs: [] },
            { name: 'No id', songs: [] },
        ]);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].id).toBe('pl-1');
    });

    it('does not lose a whole playlist because one song is malformed', () => {
        const parsed = playlistListSchema.parse([
            { id: 'pl-1', name: 'Mixed', songs: [{ id: 's1', title: 'ok' }, null, 42] },
        ]);
        expect(parsed[0].songs).toHaveLength(1);
        expect(parsed[0].songs[0].artist).toBe('Unknown');
    });

    it('names an untitled playlist', () => {
        expect(playlistListSchema.parse([{ id: 'pl-1' }])[0].name).toBe('Untitled');
    });
});

describe('queueSchema', () => {
    it('drops entries with no uid, since removal keys off it', () => {
        const parsed = queueSchema.parse([
            { uid: 'q1', song: { id: 's1' }, playlistId: 'pl-1' },
            { song: { id: 's2' }, playlistId: 'pl-1' },
        ]);
        expect(parsed.map(entry => entry.uid)).toEqual(['q1']);
    });

    it('accepts a numeric playlist id (legacy rows)', () => {
        const parsed = queueSchema.parse([{ uid: 'q1', song: { id: 's1' }, playlistId: 7 }]);
        expect(parsed[0].playlistId).toBe(7);
    });
});

describe('stationListSchema', () => {
    it('drops a station with no url, which would fail silently at play time', () => {
        const parsed = stationListSchema.parse([
            { id: 'a', title: 'Good', url: 'https://example.com/stream' },
            { id: 'b', title: 'Broken' },
        ]);
        expect(parsed.map(station => station.id)).toEqual(['a']);
    });
});

describe('settingsSchema', () => {
    it('defaults an empty payload', () => {
        expect(settingsSchema.parse({})).toEqual({ minimalHud: false });
    });

    it('drops a fade value outside the allowed range', () => {
        expect(settingsSchema.parse({ minimalHud: false, fadeOut: 300 }).fadeOut).toBeUndefined();
        expect(settingsSchema.parse({ minimalHud: false, fadeOut: 2 }).fadeOut).toBe(2);
    });

    it('drops an unknown hud position', () => {
        expect(settingsSchema.parse({ minimalHud: true, minimalHudPosition: 'middle' }).minimalHudPosition)
            .toBeUndefined();
    });
});

describe('openPayloadSchema', () => {
    it('survives a payload where the player table is missing', () => {
        const parsed = openPayloadSchema.parse({ playlist: [], accounts: [] });
        expect(parsed.player.queue).toEqual([]);
    });

    it('normalises the queue that rides along with the player', () => {
        const parsed = openPayloadSchema.parse({
            playlist: null,
            player: { queue: [{ uid: 'q1', song: { id: 's1' }, playlistId: 'pl-1' }] },
        });
        expect(parsed.player.queue).toHaveLength(1);
        expect(parsed.playlist).toBeNull();
    });
});

describe('readyPayloadSchema', () => {
    it('defaults the station list and reserved playlist id', () => {
        const parsed = readyPayloadSchema.parse({ languageName: 'tr', settings: {} });
        expect(parsed.stations).toEqual([]);
        expect(parsed.stationsPlaylistId).toBe('__radio');
    });
});
