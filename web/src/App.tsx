import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { loadLocale } from '@/lib/i18n';
import { useStore } from '@/store';
import { fetchNui, isEnvBrowser, useNuiEvent } from '@/lib/nui';
import { usePlayerBridge } from '@/hooks/usePlayerBridge';
import router from '@/routes';
import ShortDisplay from '@/components/ShortDisplay';
import BusyCursor from '@/components/BusyCursor';
import type { LuaPlayer, OpenPayload, Playlist, QueueEntry, ReadyListener, Song } from '@/types';

if (isEnvBrowser()) {
    import('@/lib/mock');
}

function App() {
    const reduce = useReducedMotion();
    const visible = useStore(s => s.visible);
    const setVisible = useStore(s => s.setVisible);

    usePlayerBridge();

    useEffect(() => {
        fetchNui('uiReady');
        if (isEnvBrowser()) {
            document.body.style.background = '#3a4048 url(https://picsum.photos/seed/game/1920/1080) center/cover';
        }
    }, []);

    useNuiEvent<ReadyListener>('onUiReady', (data) => {
        loadLocale(data);
        useStore.getState().hydrateReady(data);
    });

    useNuiEvent<OpenPayload>('open', (data) => {
        useStore.getState().hydrateOpen(data);
    });

    useNuiEvent<{ state: boolean; playlist?: Playlist[]; currentSound?: Song; player?: LuaPlayer }>(
        'toggleShortDisplay',
        (data) => useStore.getState().hydrateShortDisplay(data),
    );

    useNuiEvent<LuaPlayer>('setCurrentSong', (data) => {
        useStore.getState().hydrateCurrentSong(data);
    });

    useNuiEvent<Playlist[]>('setPlaylist', (data) => {
        useStore.getState().hydratePlaylists(data);
    });

    useNuiEvent<QueueEntry[]>('setQueue', (queue) => {
        useStore.getState().hydrateQueue(queue ?? []);
    });

    useNuiEvent<Playlist>('receivePlaylist', (playlist) => {
        const { playlists } = useStore.getState();
        if (!playlists) return;
        useStore.getState().persistPlaylists([...playlists, playlist]);
    });

    useNuiEvent('destroyed', () => useStore.getState().hydrateCleared());
    useNuiEvent('clearSound', () => useStore.getState().hydrateCleared());
    useNuiEvent<boolean>('setWaitingForResponse', (waiting) => useStore.getState().hydrateWaiting(waiting));
    useNuiEvent<{ time: number }>('timeUpdate', ({ time }) => useStore.getState().hydrateTime(time));

    useNuiEvent<{ msg: string; type: 'info' | 'error' | 'success' }>('notification', (data) => {
        useStore.getState().toast(data.msg, data.type);
    });

    useNuiEvent('close', () => {
        setVisible(false);
        fetchNui('close');
    });

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.code !== 'Escape' || !useStore.getState().visible) return;
            setVisible(false);
            fetchNui('close');
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [setVisible]);

    return (
        <>
            <BusyCursor />
            <ShortDisplay />
            <AnimatePresence>
                {visible && (
                    <motion.main
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full h-full flex items-center justify-center bg-black/45"
                    >
                        <RouterProvider router={router} />
                    </motion.main>
                )}
            </AnimatePresence>
        </>
    );
}

export default App;
