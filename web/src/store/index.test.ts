import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LIKED_ID, RADIO_ID, RECENT_ID, RECENT_LIMIT } from '@/lib/reserved';
import type { Playlist, Song } from '@/types';

const fetchNuiMock = vi.hoisted(() => vi.fn(async (..._args: unknown[]) => undefined));

vi.mock('@/lib/nui', () => ({
    fetchNui: fetchNuiMock,
    isEnvBrowser: () => true,
}));

vi.mock('@heroui/react', () => ({ addToast: vi.fn() }));

import { useStore } from './index';

const song = (id: string, extra: Partial<Song> = {}): Song => ({
    id,
    soundId: `sound-${id}`,
    title: `Song ${id}`,
    artist: 'Artist',
    cover: '',
    duration: 100,
    ...extra,
});

const playlist = (id: string, songs: Song[]): Playlist => ({ id, name: `List ${id}`, songs });

const reset = (state: Partial<ReturnType<typeof useStore.getState>> = {}) => {
    useStore.setState({
        playlists: [],
        queue: [],
        stations: [],
        currentSong: undefined,
        playingPlaylistId: undefined,
        waiting: false,
        visible: true,
        ...state,
    } as never);
};

beforeEach(() => {
    fetchNuiMock.mockClear();
    reset();
});

describe('queue intent', () => {
    it('sends an operation rather than the array, so the server stays authoritative', () => {
        useStore.getState().enqueue(song('a'), 'pl-1');
        expect(fetchNuiMock).toHaveBeenCalledWith('queue', {
            op: 'add',
            soundId: 'sound-a',
            playlistId: 'pl-1',
        });
    });

    it('uses addNext for play-next', () => {
        useStore.getState().enqueue(song('a'), 'pl-1', true);
        expect(fetchNuiMock.mock.calls[0][1]).toMatchObject({ op: 'addNext' });
    });

    it('refuses to queue a radio stream, which has no library row to resolve', () => {
        useStore.getState().enqueue(song('radio', { isStream: true }), RADIO_ID);
        expect(fetchNuiMock).not.toHaveBeenCalled();
    });

    it('converts a zero-based drop index to a Lua index', () => {
        useStore.setState({ queue: [{ uid: 'q1', song: song('a'), playlistId: 'pl-1' }] } as never);
        useStore.getState().moveQueue('q1', 0);
        expect(fetchNuiMock).toHaveBeenCalledWith('queue', { op: 'move', uid: 'q1', toIndex: 1 });
    });
});

describe('next()', () => {
    it('asks the server to advance instead of popping locally', () => {
        reset({
            currentSong: song('a'),
            queue: [{ uid: 'q1', song: song('b'), playlistId: 'pl-1' }],
        });
        useStore.getState().next();
        expect(fetchNuiMock).toHaveBeenCalledWith('nextFromQueue', undefined, false);
        expect(useStore.getState().queue).toHaveLength(1);
    });

    it('walks the station list while a stream is playing', () => {
        const stations = [
            { id: 's1', title: 'One', artist: '', cover: '', url: 'u1' },
            { id: 's2', title: 'Two', artist: '', cover: '', url: 'u2' },
        ];
        reset({ stations, currentSong: song('s1', { isStream: true }) });
        const play = vi.spyOn(useStore.getState(), 'play').mockResolvedValue();
        useStore.getState().next();
        expect(play).toHaveBeenCalledWith(expect.objectContaining({ id: 's2' }), RADIO_ID);
    });

    it('does nothing without a current song', () => {
        useStore.getState().next();
        expect(fetchNuiMock).not.toHaveBeenCalled();
    });
});

describe('toggleLike', () => {
    it('creates the liked playlist on first use', () => {
        useStore.getState().toggleLike(song('a'));
        const liked = useStore.getState().playlists?.find(p => p.id === LIKED_ID);
        expect(liked?.songs.map(s => s.id)).toEqual(['a']);
    });

    it('removes the song on a second call', () => {
        useStore.getState().toggleLike(song('a'));
        useStore.getState().toggleLike(song('a'));
        expect(useStore.getState().playlists?.find(p => p.id === LIKED_ID)?.songs).toHaveLength(0);
    });

    it('persists through the same setPlaylist callback the library uses', () => {
        useStore.getState().toggleLike(song('a'));
        expect(fetchNuiMock).toHaveBeenCalledWith('setPlaylist', expect.objectContaining({
            playlist: expect.any(Array),
        }));
    });
});

describe('pushRecent', () => {
    it('puts the newest song first and does not duplicate it', () => {
        useStore.getState().pushRecent(song('a'));
        useStore.getState().pushRecent(song('b'));
        useStore.getState().pushRecent(song('a'));
        const recent = useStore.getState().playlists?.find(p => p.id === RECENT_ID);
        expect(recent?.songs.map(s => s.id)).toEqual(['a', 'b']);
    });

    it('ignores a repeat of the song already at the top', () => {
        useStore.getState().pushRecent(song('a'));
        const before = useStore.getState().playlists;
        useStore.getState().pushRecent(song('a'));
        expect(useStore.getState().playlists).toBe(before);
    });

    it('never grows past the limit', () => {
        for (let index = 0; index < RECENT_LIMIT + 10; index++) {
            useStore.getState().pushRecent(song(`s${index}`));
        }
        const recent = useStore.getState().playlists?.find(p => p.id === RECENT_ID);
        expect(recent?.songs).toHaveLength(RECENT_LIMIT);
    });

    it('skips radio streams: a station is not a track you came back to', () => {
        useStore.getState().pushRecent(song('radio', { isStream: true }));
        expect(useStore.getState().playlists?.find(p => p.id === RECENT_ID)).toBeUndefined();
    });
});

describe('library intent', () => {
    it('does not add the same song to a playlist twice', () => {
        reset({ playlists: [playlist('pl-1', [song('a')])] });
        useStore.getState().addSongToPlaylist(song('a'), 'pl-1');
        expect(fetchNuiMock).not.toHaveBeenCalled();
    });

    it('moves a song out of the source playlist and into the target', () => {
        reset({ playlists: [playlist('pl-1', [song('a')]), playlist('pl-2', [])] });
        useStore.getState().moveSongToPlaylist(song('a'), 'pl-1', 'pl-2');
        const playlists = useStore.getState().playlists!;
        expect(playlists.find(p => p.id === 'pl-1')?.songs).toHaveLength(0);
        expect(playlists.find(p => p.id === 'pl-2')?.songs.map(s => s.id)).toEqual(['a']);
    });

    it('gives a duplicate its own id so the two do not share a route', () => {
        const source = playlist('pl-1', [song('a')]);
        reset({ playlists: [source] });
        useStore.getState().duplicatePlaylist(source);
        const playlists = useStore.getState().playlists!;
        expect(playlists).toHaveLength(2);
        expect(playlists[1].id).not.toBe('pl-1');
        expect(playlists[1].songs).toHaveLength(1);
    });

    it('keeps pinned playlists above the library when reordering', () => {
        reset({
            playlists: [
                playlist('pl-1', []),
                { id: LIKED_ID, name: 'Liked', songs: [] },
            ],
        });
        useStore.getState().reorderPlaylists([playlist('pl-1', []), { id: LIKED_ID, name: 'Liked', songs: [] }]);
        expect(useStore.getState().playlists?.[0].id).toBe(LIKED_ID);
    });
});

describe('hydration', () => {
    it('repairs a song with no artist rather than crashing the library', () => {
        useStore.getState().hydratePlaylists([
            { id: 'pl-1', name: 'Legacy', songs: [{ id: 's1', title: 'No artist' }] },
        ] as never);
        const song = useStore.getState().playlists![0].songs[0];
        expect(song.artist).toBe('Unknown');
    });

    it('reads the queue that rides along with the player on open', () => {
        useStore.getState().hydrateOpen({
            playlist: [],
            player: { queue: [{ uid: 'q1', song: { id: 's1' }, playlistId: 'pl-1' }] },
        } as never);
        expect(useStore.getState().queue).toHaveLength(1);
    });

    it('never calls back into Lua while hydrating', () => {
        useStore.getState().hydrateQueue([{ uid: 'q1', song: song('a'), playlistId: 'pl-1' }]);
        useStore.getState().hydratePlaylists([playlist('pl-1', [])]);
        expect(fetchNuiMock).not.toHaveBeenCalled();
    });
});
