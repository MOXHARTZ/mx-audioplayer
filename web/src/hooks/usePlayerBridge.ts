import { useEffect } from 'react';
import { useStore } from '@/store';
import { useNuiEvent } from '@/lib/nui';

export const usePlayerBridge = () => {
    const togglePlay = useStore(s => s.togglePlay);
    const next = useStore(s => s.next);
    const previous = useStore(s => s.previous);
    const nudgeVolume = useStore(s => s.nudgeVolume);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.shiftKey) return;
            const target = e.target as HTMLElement | null;
            if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
            switch (e.key) {
                case 'K':
                case 'k':
                    togglePlay();
                    break;
                case 'ArrowRight':
                    next();
                    break;
                case 'ArrowLeft':
                    previous();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    nudgeVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    nudgeVolume(-0.1);
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [togglePlay, next, previous, nudgeVolume]);

    useNuiEvent('togglePlay', togglePlay);
    useNuiEvent('nextSong', next);
    useNuiEvent('previousSong', previous);
    useNuiEvent('volumeUp', () => nudgeVolume(0.1));
    useNuiEvent('volumeDown', () => nudgeVolume(-0.1));
};
