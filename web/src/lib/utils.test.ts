import { describe, expect, it } from 'vitest';
import { clamp, formatDuration, includesFold, isUrl, matchesSong, nanoid } from './utils';
import { LIKED_ID, RADIO_ID, RECENT_ID, isReservedPlaylist } from './reserved';
import { SONG_DRAG_TYPE, readSongDrag, writeSongDrag } from './drag';

describe('includesFold / matchesSong', () => {
    it('does not throw when the field is missing', () => {
        expect(() => matchesSong({ title: 'a' }, 'a')).not.toThrow();
        expect(matchesSong({ title: undefined, artist: undefined }, 'a')).toBe(false);
    });

    it('matches on either title or artist, case insensitively', () => {
        expect(matchesSong({ title: 'LUXURIA', artist: 'Ceg' }, 'luxu')).toBe(true);
        expect(matchesSong({ title: 'LUXURIA', artist: 'Ceg' }, 'ceg')).toBe(true);
        expect(matchesSong({ title: 'LUXURIA', artist: 'Ceg' }, 'zzz')).toBe(false);
    });

    it('treats a non-string value as no match', () => {
        expect(includesFold(42, '4')).toBe(false);
        expect(includesFold(null, '')).toBe(false);
    });
});

describe('formatDuration', () => {
    it('pads seconds', () => {
        expect(formatDuration(65)).toBe('1:05');
        expect(formatDuration(600)).toBe('10:00');
    });

    it('renders unknown or broken durations as zero', () => {
        expect(formatDuration(0)).toBe('0:00');
        expect(formatDuration(-4)).toBe('0:00');
        expect(formatDuration(Number.NaN)).toBe('0:00');
    });
});

describe('clamp', () => {
    it('holds the bounds', () => {
        expect(clamp(1.4, 0, 1)).toBe(1);
        expect(clamp(-2, 0, 1)).toBe(0);
        expect(clamp(0.5, 0, 1)).toBe(0.5);
    });
});

describe('nanoid', () => {
    it('produces ids of the requested length that do not collide', () => {
        const ids = new Set(Array.from({ length: 200 }, () => nanoid(12)));
        expect(ids.size).toBe(200);
        expect([...ids][0]).toHaveLength(12);
    });
});

describe('isUrl', () => {
    it('accepts absolute urls and rejects loose text', () => {
        expect(isUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
        expect(isUrl('not a url')).toBe(false);
    });
});

describe('reserved playlists', () => {
    it('recognises every reserved id', () => {
        expect(isReservedPlaylist(LIKED_ID)).toBe(true);
        expect(isReservedPlaylist(RECENT_ID)).toBe(true);
        expect(isReservedPlaylist(RADIO_ID)).toBe(true);
    });

    it('leaves user playlists alone', () => {
        expect(isReservedPlaylist('pl-1')).toBe(false);
        expect(isReservedPlaylist(7)).toBe(false);
        expect(isReservedPlaylist(undefined)).toBe(false);
    });
});

describe('song drag payload', () => {
    const makeTransfer = () => {
        const store = new Map<string, string>();
        return {
            setData: (type: string, value: string) => store.set(type, value),
            getData: (type: string) => store.get(type) ?? '',
            effectAllowed: 'none',
        } as unknown as DataTransfer;
    };

    it('round trips a song', () => {
        const transfer = makeTransfer();
        const song = { id: 's1', soundId: 'sound', title: 't', artist: 'a', cover: '', duration: 1 };
        writeSongDrag(transfer, { song, fromPlaylistId: 'pl-1' });
        expect(readSongDrag(transfer)).toEqual({ song, fromPlaylistId: 'pl-1' });
    });

    it('ignores drags that are not ours', () => {
        const transfer = makeTransfer();
        transfer.setData('text/plain', 'hello');
        expect(readSongDrag(transfer)).toBeNull();
    });

    it('ignores malformed json', () => {
        const transfer = makeTransfer();
        transfer.setData(SONG_DRAG_TYPE, '{ not json');
        expect(readSongDrag(transfer)).toBeNull();
    });
});
