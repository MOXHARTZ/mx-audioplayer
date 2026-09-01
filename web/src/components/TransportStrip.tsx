import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    IoVolumeHighOutline, IoVolumeLowOutline, IoVolumeMuteOutline, IoListOutline,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { TransportButtons, SeekLine, TimeReadout } from './PlayerControls';
import Slider from './ui/Slider';

const VolumeControl = memo(() => {
    const volume = useStore(s => s.volume);
    const setVolume = useStore(s => s.setVolume);
    const [scrub, setScrub] = useState<number | null>(null);
    const shown = scrub ?? volume;

    const Icon = shown === 0
        ? IoVolumeMuteOutline
        : shown < 0.5 ? IoVolumeLowOutline : IoVolumeHighOutline;

    return (
        <div className="flex items-center gap-2.5 w-[170px] shrink-0">
            <Icon size={17} className="text-bone-3 shrink-0" />
            <div className="flex-1 min-w-0">
                <Slider
                    value={shown}
                    max={1}
                    step={0.01}
                    onChange={setScrub}
                    onChangeEnd={(value) => {
                        setScrub(null);
                        setVolume(value);
                    }}
                    aria-label="volume"
                />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-bone-4 w-[26px] text-right shrink-0">
                {Math.round(shown * 100)}
            </span>
        </div>
    );
});

VolumeControl.displayName = 'VolumeControl';

const TransportStrip = () => {
    const { t } = useTranslation();
    const queue = useStore(s => s.queue);
    const queueOpen = useStore(s => s.queueOpen);
    const setQueueOpen = useStore(s => s.setQueueOpen);

    return (
        <footer className="shrink-0 bg-ink-1">
            <SeekLine />

            <div className="h-[68px] px-5 flex items-center gap-4">
                <TransportButtons />

                <span className="shrink-0 pl-1">
                    <TimeReadout />
                </span>

                <div className="flex-1" />

                <button
                    onClick={() => setQueueOpen(!queueOpen)}
                    aria-label={t('queue.title')}
                    title={t('queue.title')}
                    className={cn(
                        'h-9 pl-2.5 pr-3 rounded-lg flex items-center gap-2 shrink-0 border',
                        'text-xs font-semibold select-none',
                        'transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-95',
                        queueOpen
                            ? 'text-white bg-ember/20 border-ember/50'
                            : 'text-bone-3 bg-ink-2/60 border-ink-3/50 hover:text-white hover:border-ink-4/70',
                    )}
                >
                    <IoListOutline size={17} />
                    <span className="font-mono tabular-nums">{queue.length}</span>
                </button>

                <VolumeControl />
            </div>
        </footer>
    );
};

export default memo(TransportStrip);
