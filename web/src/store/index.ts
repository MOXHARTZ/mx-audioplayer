import { create } from 'zustand';
import i18next from 'i18next';
import { addToast } from '@heroui/react';
import { fetchNui, isEnvBrowser } from '@/lib/nui';
import { clamp, nanoid } from '@/lib/utils';
import { LIKED_ID, RADIO_ID, RECENT_ID, RECENT_LIMIT, isReservedPlaylist } from '@/lib/reserved';
import {
    luaPlayerSchema, openPayloadSchema, playlistListSchema, queueSchema, readyPayloadSchema,
} from '@/schemas/nui';
import type {
    Account, LuaPlayer, OpenPayload, Playlist, QueueEntry, RadioStation,
    ReadyListener, Settings, Song, ToastType,
} from '@/types';

interface StoreState {
    visible: boolean;
    shortDisplay: boolean;

    user?: Account;
    accounts: Account[];
    settings: Settings;

    playlists: Playlist[] | null;

    stations: RadioStation[];
    fadeConfig?: { enable: boolean; in: number; out: number; allowPlayerOverride: boolean };

    queue: QueueEntry[];
    queueOpen: boolean;

    playing: boolean;
    currentSong?: Song;
    playingPlaylistId?: string | number;
    volume: number;
    shuffle: boolean;
    repeat: boolean;
    duration: number;
    timeStamp: number;
    waiting: boolean;

    editMode: boolean;
    selectedSongs: string[];

    hydrateOpen: (data: OpenPayload) => void;
    hydrateShortDisplay: (data: { state: boolean; playlist?: Playlist[]; currentSound?: Song; player?: LuaPlayer }) => void;
    hydrateCurrentSong: (player: LuaPlayer) => void;
    hydratePlaylists: (playlists: Playlist[]) => void;
    hydrateCleared: () => void;
    hydrateWaiting: (waiting: boolean) => void;
    hydrateTime: (time: number) => void;
    hydrateSettings: (settings: Settings) => void;
    hydrateReady: (data: ReadyListener) => void;
    hydrateQueue: (queue: QueueEntry[]) => void;
    setVisible: (visible: boolean) => void;

    play: (song: Song, playlistId: string | number) => Promise<void>;
    togglePlay: () => void;
    stopPlayback: () => void;
    next: () => void;
    previous: () => void;
    seek: (position: number) => void;
    setVolume: (volume: number) => void;
    nudgeVolume: (delta: number) => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;

    setQueueOpen: (open: boolean) => void;
    enqueue: (song: Song, playlistId: string | number, next?: boolean) => void;
    dequeue: (uid: string) => void;
    moveQueue: (uid: string, toIndex: number) => void;
    clearQueue: () => void;

    playStation: (station: RadioStation) => void;

    persistPlaylists: (playlists: Playlist[]) => void;
    duplicatePlaylist: (playlist: Playlist) => void;
    addSongToPlaylist: (song: Song, playlistId: string | number) => void;
    moveSongToPlaylist: (song: Song, fromPlaylistId: string | number, toPlaylistId: string | number) => void;
    toggleLike: (song: Song) => void;
    pushRecent: (song: Song) => void;
    addPlaylist: (playlist: Playlist) => void;
    updatePlaylist: (playlist: Playlist) => void;
    deletePlaylist: (id: string | number) => void;
    reorderPlaylists: (playlists: Playlist[]) => void;
    setPlaylistSongs: (playlistId: string | number, songs: Song[]) => void;
    removeSongs: (playlistId: string | number, songIds: string[]) => void;

    setEditMode: (editMode: boolean) => void;
    setSelectedSongs: (ids: string[]) => void;

    saveSettings: (settings: Settings) => void;

    toast: (message: string, type?: ToastType) => void;
}

const TOAST_COLOR: Record<ToastType, 'success' | 'danger' | 'default'> = {
    success: 'success',
    error: 'danger',
    info: 'default',
};

const withReserved = (
    playlists: Playlist[] | null,
    id: string,
    nameKey: string,
): { list: Playlist[]; playlist: Playlist } => {
    const list = [...(playlists ?? [])];
    const index = list.findIndex(p => p.id === id);
    if (index >= 0) return { list, playlist: list[index] };
    const playlist: Playlist = { id, name: i18next.t(nameKey), songs: [] };
    list.unshift(playlist);
    return { list, playlist };
};

const replacePlaylist = (list: Playlist[], playlist: Playlist): Playlist[] => {
    const index = list.findIndex(p => p.id === playlist.id);
    if (index < 0) return [playlist, ...list];
    const next = [...list];
    next[index] = playlist;
    return next;
};

const stationToSong = (station: RadioStation): Song => ({
    id: station.id,
    soundId: station.id,
    title: station.title,
    artist: station.artist,
    cover: station.cover,
    url: station.url,
    duration: 0,
    isStream: true,
});

let recentTimer: ReturnType<typeof setTimeout> | undefined;

const notifyGame = (message: string, type: ToastType) => {
    if (!isEnvBrowser()) {
        fetchNui('notification', { message, type });
    }
};

export const useStore = create<StoreState>()((set, get) => ({
    visible: false,
    shortDisplay: false,
    accounts: [],
    settings: { minimalHud: false },
    playlists: null,
    stations: [],
    queue: [],
    queueOpen: false,
    playing: false,
    volume: 1,
    shuffle: false,
    repeat: false,
    duration: 0,
    timeStamp: 0,
    waiting: false,
    editMode: false,
    selectedSongs: [],

    hydrateOpen: (raw) => {
        const parsed = openPayloadSchema.safeParse(raw);
        const data = (parsed.success ? parsed.data : raw) as OpenPayload;
        const player = data.player ?? {};
        set({
            visible: true,
            playlists: data.playlist ?? null,
            user: data.user,
            accounts: data.accounts ?? [],
            volume: player.volume ?? 1,
            shuffle: player.shuffle ?? false,
            repeat: player.repeatState ?? false,
            playing: data.currentSound ? (player.playing ?? false) : false,
            currentSong: data.currentSound ?? undefined,
            playingPlaylistId: data.currentSound ? player.currentPlaylistId : undefined,
            duration: data.currentSound?.duration ?? player.duration ?? 0,
            queue: player.queue ?? [],
        });
        if (data.currentSound) {
            fetchNui<number>('getCurrentSongDuration', undefined, data.currentSound.duration).then((duration) => {
                if (duration) set({ duration: Math.floor(duration) });
            });
            fetchNui<number>('getCurrentSongTimeStamp', undefined, 0).then((time) => {
                if (typeof time === 'number') set({ timeStamp: Math.floor(time) });
            });
        }
    },

    hydrateShortDisplay: (data) => {
        if (!data.state) {
            set({ shortDisplay: false });
            return;
        }
        const player = data.player ?? {};
        set({
            shortDisplay: true,
            playlists: data.playlist ?? get().playlists,
            currentSong: data.currentSound ?? undefined,
            playing: data.currentSound ? (player.playing ?? false) : false,
            playingPlaylistId: data.currentSound ? player.currentPlaylistId : get().playingPlaylistId,
            volume: player.volume ?? get().volume,
            shuffle: player.shuffle ?? get().shuffle,
            repeat: player.repeatState ?? get().repeat,
        });
        if (data.currentSound) {
            fetchNui<number>('getCurrentSongDuration', undefined, data.currentSound.duration).then((duration) => {
                if (duration) set({ duration: Math.floor(duration) });
            });
        }
    },

    hydrateCurrentSong: (raw) => {
        const parsed = luaPlayerSchema.safeParse(raw);
        const player = (parsed.success ? parsed.data : raw) as LuaPlayer;
        if (!player?.soundData) return;
        set({
            currentSong: player.soundData,
            playing: player.playing ?? true,
            playingPlaylistId: player.currentPlaylistId ?? get().playingPlaylistId,
            timeStamp: 0,
            waiting: false,
        });
        get().pushRecent(player.soundData);
        fetchNui<number>('getCurrentSongDuration', undefined, player.soundData.duration).then((duration) => {
            if (duration) set({ duration: Math.floor(duration) });
        });
    },

    hydratePlaylists: (playlists) => {
        const parsed = playlistListSchema.safeParse(playlists);
        set({ playlists: parsed.success ? (parsed.data as Playlist[]) : (playlists ?? []) });
    },

    hydrateQueue: (queue) => {
        const parsed = queueSchema.safeParse(queue ?? []);
        set({ queue: parsed.success ? (parsed.data as QueueEntry[]) : [] });
    },

    hydrateReady: (raw) => {
        const parsed = readyPayloadSchema.safeParse(raw);
        const data = (parsed.success ? parsed.data : raw) as ReadyListener;
        get().hydrateSettings(data.settings ?? { minimalHud: false });
        set({ stations: (data.stations ?? []) as RadioStation[], fadeConfig: data.fade });
    },

    hydrateCleared: () => set({
        playing: false,
        currentSong: undefined,
        playingPlaylistId: undefined,
        duration: 0,
        timeStamp: 0,
    }),

    hydrateWaiting: (waiting) => set({ waiting }),
    hydrateTime: (time) => set({ timeStamp: time }),
    hydrateSettings: (settings) => {
        set({ settings: { ...settings, minimalHud: settings?.minimalHud ?? false } });
    },
    setVisible: (visible) => set({ visible }),

    play: async (song, playlistId) => {
        const { waiting } = get();
        if (waiting) return;
        set({ waiting: true });
        try {
            const response = await fetchNui<true | { error: string } | undefined>(
                'play',
                { soundData: song, playlistId },
                true,
            );
            if (response && typeof response === 'object' && 'error' in response) {
                const key = `general.${response.error}`;
                get().toast(i18next.exists(key) ? i18next.t(key) : i18next.t('general.something_went_wrong'), 'error');
                set({ waiting: false });
                return;
            }
            if (!response) {
                get().toast(i18next.t('general.play_failed'), 'error');
                set({ waiting: false });
                return;
            }
            if (isEnvBrowser()) {
                set({ currentSong: song, playing: true, playingPlaylistId: playlistId, timeStamp: 0, duration: song.duration || 180, waiting: false });
            }
        } catch {
            get().toast(i18next.t('general.something_went_wrong'), 'error');
            set({ waiting: false });
        }
    },

    togglePlay: () => {
        const { currentSong, waiting, playing } = get();
        if (!currentSong || waiting) return;
        const nextPlaying = !playing;
        set({ playing: nextPlaying });
        fetchNui('togglePlay', nextPlaying);
    },

    stopPlayback: () => {
        set({ playing: false, currentSong: undefined, playingPlaylistId: undefined, duration: 0, timeStamp: 0 });
        fetchNui('stop');
    },

    next: () => {
        const { currentSong, playingPlaylistId, playlists, shuffle, waiting, play, queue, stations } = get();
        if (waiting || !currentSong) return;

        if (queue.length > 0) {
            set({ waiting: true });
            fetchNui<boolean>('nextFromQueue', undefined, false).then((advanced) => {
                if (!advanced) set({ waiting: false });
            }).catch(() => set({ waiting: false }));
            return;
        }

        if (currentSong.isStream) {
            if (stations.length < 2) return;
            const index = stations.findIndex(station => station.id === currentSong.id);
            get().playStation(stations[(index + 1) % stations.length]);
            return;
        }

        if (!playlists) return;
        const list = playlists.find(p => p.id === playingPlaylistId)?.songs ?? [];
        if (list.length === 0) {
            get().toast(i18next.t('playlist.empty'), 'error');
            return;
        }
        const index = list.findIndex(s => s.id === currentSong.id);
        let nextIndex = index === list.length - 1 ? 0 : index + 1;
        if (shuffle && list.length > 2) {
            nextIndex = Math.floor(Math.random() * (list.length - 1));
            if (nextIndex >= index) nextIndex += 1;
        }
        const nextSong = list[nextIndex];
        if (!nextSong || nextSong.id === currentSong.id) {
            get().toast(i18next.t('playlist.no_more_songs'), 'error');
            return;
        }
        play(nextSong, playingPlaylistId!);
    },

    previous: () => {
        const { currentSong, playingPlaylistId, playlists, waiting, play, stations } = get();
        if (waiting || !currentSong) return;

        if (currentSong.isStream) {
            if (stations.length < 2) return;
            const index = stations.findIndex(station => station.id === currentSong.id);
            get().playStation(stations[(index - 1 + stations.length) % stations.length]);
            return;
        }

        if (!playlists) return;
        const list = playlists.find(p => p.id === playingPlaylistId)?.songs ?? [];
        if (list.length === 0) {
            get().toast(i18next.t('playlist.empty'), 'error');
            return;
        }
        const index = list.findIndex(s => s.id === currentSong.id);
        const prevIndex = index <= 0 ? list.length - 1 : index - 1;
        const prevSong = list[prevIndex];
        if (!prevSong || prevSong.id === currentSong.id) {
            get().toast(i18next.t('playlist.no_more_songs'), 'error');
            return;
        }
        play(prevSong, playingPlaylistId!);
    },

    seek: (position) => {
        const { currentSong } = get();
        if (!currentSong) return;
        set({ timeStamp: Math.floor(position), playing: true });
        fetchNui('seek', { position });
    },

    setVolume: (volume) => {
        const clamped = clamp(volume, 0, 1);
        set({ volume: clamped });
        fetchNui('setVolume', { volume: clamped });
    },

    nudgeVolume: (delta) => {
        const { volume, setVolume } = get();
        setVolume(clamp(Math.round((volume + delta) * 100) / 100, 0, 1));
    },

    toggleShuffle: () => {
        const shuffle = !get().shuffle;
        set({ shuffle });
        fetchNui('setShuffle', shuffle);
    },

    toggleRepeat: () => {
        const repeat = !get().repeat;
        set({ repeat });
        fetchNui('setRepeat', repeat);
    },

    setQueueOpen: (open) => set({ queueOpen: open }),

    enqueue: (song, playlistId, next) => {
        if (song.isStream) return;
        fetchNui('queue', { op: next ? 'addNext' : 'add', soundId: song.soundId, playlistId });
        get().toast(i18next.t('queue.added'), 'success');
        if (isEnvBrowser()) {
            const entry: QueueEntry = { uid: nanoid(8), song, playlistId };
            set({ queue: next ? [entry, ...get().queue] : [...get().queue, entry] });
        }
    },

    dequeue: (uid) => {
        fetchNui('queue', { op: 'remove', uid });
        if (isEnvBrowser()) set({ queue: get().queue.filter(entry => entry.uid !== uid) });
    },

    moveQueue: (uid, toIndex) => {
        fetchNui('queue', { op: 'move', uid, toIndex: toIndex + 1 });
        if (isEnvBrowser()) {
            const queue = [...get().queue];
            const from = queue.findIndex(entry => entry.uid === uid);
            if (from < 0) return;
            queue.splice(toIndex, 0, queue.splice(from, 1)[0]);
            set({ queue });
        }
    },

    clearQueue: () => {
        fetchNui('queue', { op: 'clear' });
        get().toast(i18next.t('queue.cleared'), 'info');
        if (isEnvBrowser()) set({ queue: [] });
    },

    playStation: (station) => {
        get().play(stationToSong(station), RADIO_ID);
    },

    persistPlaylists: (playlists) => {
        set({ playlists });
        fetchNui('setPlaylist', { playlist: playlists });
    },

    addPlaylist: (playlist) => {
        const playlists = [...(get().playlists ?? []), playlist];
        get().persistPlaylists(playlists);
    },

    updatePlaylist: (playlist) => {
        const playlists = (get().playlists ?? []).map(p => p.id === playlist.id ? playlist : p);
        get().persistPlaylists(playlists);
    },

    deletePlaylist: (id) => {
        const { playlists, playingPlaylistId, stopPlayback, persistPlaylists } = get();
        const next = (playlists ?? []).filter(p => p.id !== id);
        if (playingPlaylistId === id) {
            stopPlayback();
        }
        persistPlaylists(next);
    },

    reorderPlaylists: (playlists) => {
        playlists = [
            ...playlists.filter(p => isReservedPlaylist(p.id)),
            ...playlists.filter(p => !isReservedPlaylist(p.id)),
        ];
        if (get().editMode) {
            set({ playlists });
        } else {
            get().persistPlaylists(playlists);
        }
    },

    setPlaylistSongs: (playlistId, songs) => {
        const playlists = (get().playlists ?? []).map(p => p.id === playlistId ? { ...p, songs } : p);
        if (get().editMode) {
            set({ playlists });
        } else {
            get().persistPlaylists(playlists);
        }
    },

    removeSongs: (playlistId, songIds) => {
        const { playlists, currentSong, playingPlaylistId, stopPlayback } = get();
        const next = (playlists ?? []).map(p =>
            p.id === playlistId ? { ...p, songs: p.songs.filter(s => !songIds.includes(s.id)) } : p
        );
        if (currentSong && playingPlaylistId === playlistId && songIds.includes(currentSong.id)) {
            stopPlayback();
        }
        get().persistPlaylists(next);
    },

    duplicatePlaylist: (playlist) => {
        get().addPlaylist({
            ...playlist,
            id: nanoid(),
            name: `${playlist.name} (${i18next.t('song.copy_suffix')})`,
            songs: [...(playlist.songs ?? [])],
        });
        get().toast(i18next.t('song.duplicated'), 'success');
    },

    addSongToPlaylist: (song, playlistId) => {
        const playlists = get().playlists ?? [];
        const target = playlists.find(p => p.id === playlistId);
        if (!target) return;
        if (target.songs.some(existing => existing.id === song.id)) {
            get().toast(i18next.t('song.already_in', { name: target.name }), 'info');
            return;
        }
        get().persistPlaylists(playlists.map(p =>
            p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p
        ));
        get().toast(i18next.t('song.added_to', { name: target.name }), 'success');
    },

    moveSongToPlaylist: (song, fromPlaylistId, toPlaylistId) => {
        if (fromPlaylistId === toPlaylistId) return;
        const playlists = get().playlists ?? [];
        const target = playlists.find(p => p.id === toPlaylistId);
        if (!target) return;
        const alreadyThere = target.songs.some(existing => existing.id === song.id);
        get().persistPlaylists(playlists.map(p => {
            if (p.id === fromPlaylistId) return { ...p, songs: p.songs.filter(s => s.id !== song.id) };
            if (p.id === toPlaylistId && !alreadyThere) return { ...p, songs: [...p.songs, song] };
            return p;
        }));
        get().toast(i18next.t('song.added_to', { name: target.name }), 'success');
    },

    toggleLike: (song) => {
        const { list, playlist } = withReserved(get().playlists, LIKED_ID, 'song.liked_playlist');
        const liked = playlist.songs.some(existing => existing.id === song.id);
        const songs = liked
            ? playlist.songs.filter(existing => existing.id !== song.id)
            : [song, ...playlist.songs];
        get().persistPlaylists(replacePlaylist(list, { ...playlist, songs }));
        get().toast(i18next.t(liked ? 'song.unliked' : 'song.liked'), liked ? 'info' : 'success');
    },

    pushRecent: (song) => {
        if (song.isStream) return;
        const { list, playlist } = withReserved(get().playlists, RECENT_ID, 'song.recent_playlist');
        if (playlist.songs[0]?.id === song.id) return;
        const songs = [song, ...playlist.songs.filter(existing => existing.id !== song.id)]
            .slice(0, RECENT_LIMIT);
        set({ playlists: replacePlaylist(list, { ...playlist, songs }) });

        clearTimeout(recentTimer);
        recentTimer = setTimeout(() => {
            const playlists = get().playlists;
            if (playlists) fetchNui('setPlaylist', { playlist: playlists });
        }, 1500);
    },

    setEditMode: (editMode) => {
        const wasEditing = get().editMode;
        set({ editMode, selectedSongs: editMode ? get().selectedSongs : [] });
        if (wasEditing && !editMode) {
            const playlists = get().playlists;
            if (playlists) fetchNui('setPlaylist', { playlist: playlists });
        }
    },

    setSelectedSongs: (ids) => set({ selectedSongs: ids }),

    saveSettings: (settings) => {
        set({ settings });
        fetchNui('saveSettings', settings);
    },

    toast: (message, type = 'info') => {
        if (!get().visible && !isEnvBrowser()) {
            notifyGame(message, type);
            return;
        }
        addToast({
            description: message,
            color: TOAST_COLOR[type],
            timeout: 3200,
        });
    },
}));
