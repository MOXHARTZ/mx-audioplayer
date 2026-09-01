import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IoPauseSharp, IoPlaySharp, IoPlaySkipBackSharp, IoPlaySkipForwardSharp,
    IoRepeatSharp, IoShuffleSharp,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';
import Slider from './ui/Slider';
import Spinner from './ui/Spinner';

export const TransportButtons = memo(({ size = 'md' }: { size?: 'sm' | 'md' }) => {
    const playing = useStore(s => s.playing);
    const waiting = useStore(s => s.waiting);
    const shuffle = useStore(s => s.shuffle);
    const repeat = useStore(s => s.repeat);
    const currentSong = useStore(s => s.currentSong);
    const togglePlay = useStore(s => s.togglePlay);
    const next = useStore(s => s.next);
    const previous = useStore(s => s.previous);
    const toggleShuffle = useStore(s => s.toggleShuffle);
    const toggleRepeat = useStore(s => s.toggleRepeat);

    const playSize = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
    const iconSize = size === 'sm' ? 16 : 18;

    const secondary = cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-bone-2',
        'transition-[color,transform] duration-150 ease-out hover:text-white',
        'active:scale-95 disabled:opacity-40 disabled:pointer-events-none',
    );

    return (
        <div className="flex items-center justify-center gap-1.5">
            <button
                onClick={toggleShuffle}
                aria-label="shuffle"
                className={cn(secondary, shuffle && 'text-brass')}
            >
                <IoShuffleSharp size={iconSize} />
            </button>
            <button
                onClick={previous}
                disabled={waiting || !currentSong}
                aria-label="previous"
                className={secondary}
            >
                <IoPlaySkipBackSharp size={iconSize} />
            </button>
            <button
                onClick={togglePlay}
                disabled={waiting || !currentSong}
                aria-label={playing ? 'pause' : 'play'}
                className={cn(
                    playSize,
                    'rounded-full bg-primary-glow flex items-center justify-center mx-1',
                    'transition-transform duration-150 ease-out active:scale-[0.94] hover:scale-[1.04]',
                    'disabled:opacity-40 disabled:pointer-events-none',
                )}
            >
                {waiting ? (
                    <Spinner size={iconSize} />
                ) : playing ? (
                    <IoPauseSharp size={iconSize + 2} />
                ) : (
                    <IoPlaySharp size={iconSize + 2} className="ml-0.5" />
                )}
            </button>
            <button
                onClick={next}
                disabled={waiting || !currentSong}
                aria-label="next"
                className={secondary}
            >
                <IoPlaySkipForwardSharp size={iconSize} />
            </button>
            <button
                onClick={toggleRepeat}
                aria-label="repeat"
                className={cn(secondary, repeat && 'text-brass')}
            >
                <IoRepeatSharp size={iconSize} />
            </button>
        </div>
    );
});

TransportButtons.displayName = 'TransportButtons';

export const ProgressBar = memo(({ compact }: { compact?: boolean }) => {
    const { t } = useTranslation();
    const timeStamp = useStore(s => s.timeStamp);
    const duration = useStore(s => s.duration);
    const currentSong = useStore(s => s.currentSong);
    const seek = useStore(s => s.seek);
    const [scrub, setScrub] = useState<number | null>(null);

    const shown = scrub ?? timeStamp;
    const total = duration || currentSong?.duration || 0;
    const isLive = !!currentSong && (currentSong.isStream || total <= 0);

    if (isLive) {
        return (
            <div className="w-full flex items-center justify-center py-1">
                <span className="flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-3 py-1">
                    <span className="flex items-end gap-[2px] h-2.5" aria-hidden>
                        <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                        <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                        <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.18em] text-ember-2">
                        {t('station.live')}
                    </span>
                </span>
            </div>
        );
    }

    return (
        <div className={cn('w-full flex items-center gap-2.5', compact ? 'text-[10px]' : 'text-xs')}>
            <span className="text-bone-4 font-medium tabular-nums min-w-[34px] text-right">
                {formatDuration(shown)}
            </span>
            <Slider
                value={shown}
                max={total}
                disabled={!currentSong}
                onChange={setScrub}
                onChangeEnd={(value) => {
                    setScrub(null);
                    seek(Math.floor(value));
                }}
                aria-label="progress"
            />
            <span className="text-bone-4 font-medium tabular-nums min-w-[34px]">
                {formatDuration(total)}
            </span>
        </div>
    );
});

ProgressBar.displayName = 'ProgressBar';

export const SeekLine = memo(() => {
    const timeStamp = useStore(s => s.timeStamp);
    const duration = useStore(s => s.duration);
    const currentSong = useStore(s => s.currentSong);
    const seek = useStore(s => s.seek);
    const [scrub, setScrub] = useState<number | null>(null);

    const total = duration || currentSong?.duration || 0;
    const isLive = !!currentSong && (currentSong.isStream || total <= 0);

    if (isLive) return <div className="h-[3px] w-full bg-ink-3/50" />;

    return (
        <Slider
            edge
            value={scrub ?? timeStamp}
            max={total}
            disabled={!currentSong}
            onChange={setScrub}
            onChangeEnd={(value) => {
                setScrub(null);
                seek(Math.floor(value));
            }}
            aria-label="progress"
        />
    );
});

SeekLine.displayName = 'SeekLine';

export const TimeReadout = memo(() => {
    const { t } = useTranslation();
    const timeStamp = useStore(s => s.timeStamp);
    const duration = useStore(s => s.duration);
    const currentSong = useStore(s => s.currentSong);

    const total = duration || currentSong?.duration || 0;
    const isLive = !!currentSong && (currentSong.isStream || total <= 0);

    if (isLive) {
        return (
            <span className="flex items-center gap-1.5">
                <span className="flex items-end gap-[2px] h-2.5" aria-hidden>
                    <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                    <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                    <span className="eq-bar w-[2px] h-full rounded-sm bg-ember" />
                </span>
                <span className="text-[10px] font-bold tracking-[0.18em] text-ember-2">
                    {t('station.live')}
                </span>
            </span>
        );
    }

    return (
        <span className="font-mono text-[11px] tabular-nums text-bone-4">
            {formatDuration(timeStamp)}
            <span className="mx-1 text-ink-4">/</span>
            {formatDuration(total)}
        </span>
    );
});

TimeReadout.displayName = 'TimeReadout';
