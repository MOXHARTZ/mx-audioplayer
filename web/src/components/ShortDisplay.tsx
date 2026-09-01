import { memo, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { IoVolumeHighOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { cn, formatDuration } from '@/lib/utils';
import CoverImage from './CoverImage';
import ScrollingText from './ScrollingText';
import { TransportButtons } from './PlayerControls';
import Kbd from './ui/Kbd';
import type { MinimalHudPosition } from '@/types';

const positionClasses: Record<MinimalHudPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
};

const enterOffset: Record<MinimalHudPosition, { y: number }> = {
    'top-left': { y: -16 },
    'top-right': { y: -16 },
    'bottom-left': { y: 16 },
    'bottom-right': { y: 16 },
};

const ShortDisplay = () => {
    const { t } = useTranslation();
    const reduce = useReducedMotion();
    const visible = useStore(s => s.shortDisplay && !s.visible && s.settings.minimalHud);
    const position = useStore(s => s.settings.minimalHudPosition) ?? 'bottom-right';
    const currentSong = useStore(s => s.currentSong);
    const volume = useStore(s => s.volume);
    const timeStamp = useStore(s => s.timeStamp);
    const duration = useStore(s => s.duration);

    const [volumeVisible, setVolumeVisible] = useState(false);
    const volumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const prevVolume = useRef(volume);

    useEffect(() => {
        if (prevVolume.current !== volume && visible) {
            setVolumeVisible(true);
            clearTimeout(volumeTimer.current);
            volumeTimer.current = setTimeout(() => setVolumeVisible(false), 2200);
        }
        prevVolume.current = volume;
        return () => clearTimeout(volumeTimer.current);
    }, [volume, visible]);

    if (!currentSong) return null;

    const progress = duration > 0 ? Math.min(timeStamp / duration, 1) : 0;
    const isLive = currentSong.isStream || duration <= 0;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={reduce ? { opacity: 0 } : { opacity: 0, ...enterOffset[position], scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, ...enterOffset[position], scale: 0.97 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className={cn('absolute z-50 w-[340px]', positionClasses[position])}
                >
                    <div className="bezel overflow-hidden">
                        <div className="p-3 flex items-center gap-3">
                            <CoverImage
                                src={currentSong.cover}
                                alt={currentSong.title}
                                className="w-14 h-14 rounded-lg object-cover shrink-0 border border-ink-3/50"
                                fallbackClassName="rounded-lg border border-ink-3/50"
                            />
                            <div className="min-w-0 flex-1">
                                <ScrollingText className="text-sm text-white font-semibold">
                                    {currentSong.title}
                                </ScrollingText>
                                <ScrollingText className="text-xs text-bone-4">
                                    {currentSong.artist}
                                </ScrollingText>
                                {isLive ? (
                                    <span className="inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-bold tracking-[0.18em] text-ember-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-ember" />
                                        {t('station.live')}
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] text-bone-4 tabular-nums">{formatDuration(timeStamp)}</span>
                                        <div className="flex-1 h-1 rounded-full bg-ink-3/70 overflow-hidden">
                                            <div className="h-full bg-ember rounded-full" style={{ width: `${progress * 100}%` }} />
                                        </div>
                                        <span className="text-[10px] text-bone-4 tabular-nums">{formatDuration(duration)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-3 pb-2.5 flex items-center justify-between">
                            <TransportButtons size="sm" />
                            <AnimatePresence mode="popLayout">
                                {volumeVisible ? (
                                    <motion.div
                                        key="volume"
                                        initial={{ opacity: 0, x: 6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 6 }}
                                        transition={{ duration: 0.14 }}
                                        className="flex items-center gap-1.5 text-brass"
                                    >
                                        <IoVolumeHighOutline size={14} />
                                        <span className="text-xs font-semibold tabular-nums">{Math.round(volume * 100)}%</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="hint"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.14 }}
                                        className="flex items-center gap-1 text-[10px] text-bone-4"
                                    >
                                        <Kbd>⇧K</Kbd> {t('keyboard.shortcut.toggle')}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default memo(ShortDisplay);
