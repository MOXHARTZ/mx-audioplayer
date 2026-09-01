import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Switch from '@/components/ui/Switch';
import Slider from '@/components/ui/Slider';
import Kbd from '@/components/ui/Kbd';
import type { MinimalHudPosition } from '@/types';

const POSITIONS: MinimalHudPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const positionLabelKey: Record<MinimalHudPosition, string> = {
    'top-left': 'settings.minimal_hud.position.top_left',
    'top-right': 'settings.minimal_hud.position.top_right',
    'bottom-left': 'settings.minimal_hud.position.bottom_left',
    'bottom-right': 'settings.minimal_hud.position.bottom_right',
};

const cornerClass: Record<MinimalHudPosition, string> = {
    'top-left': 'top-1 left-1',
    'top-right': 'top-1 right-1',
    'bottom-left': 'bottom-1 left-1',
    'bottom-right': 'bottom-1 right-1',
};

const FadeSlider = ({ label, value, onCommit }: {
    label: string;
    value: number;
    onCommit: (value: number) => void;
}) => {
    const { t } = useTranslation();
    const [dragging, setDragging] = useState<number | null>(null);
    const shown = dragging ?? value;

    useEffect(() => {
        setDragging(null);
    }, [value]);

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="field-label">{label}</span>
                <span className="text-xs font-semibold text-bone-2 tabular-nums">
                    {shown <= 0 ? t('fade.off') : t('fade.seconds', { value: shown.toFixed(1) })}
                </span>
            </div>
            <Slider
                value={shown}
                max={8}
                step={0.5}
                onChange={setDragging}
                onChangeEnd={(next) => {
                    setDragging(null);
                    if (next !== value) onCommit(next);
                }}
                aria-label={label}
            />
        </div>
    );
};

const SettingsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { t } = useTranslation();
    const settings = useStore(s => s.settings);
    const saveSettings = useStore(s => s.saveSettings);
    const fade = useStore(s => s.fadeConfig);

    const showFade = !!fade?.enable && fade.allowPlayerOverride !== false;
    const fadeOut = settings.fadeOut ?? fade?.out ?? 0;
    const fadeIn = settings.fadeIn ?? fade?.in ?? 0;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('settings.title')}
            description={t('settings.subtitle')}
            size="md"
        >
            <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{t('settings.minimal_hud.title')}</p>
                        <p className="text-xs text-bone-4 mt-1 leading-relaxed">
                            {t('settings.minimal_hud.description')}
                        </p>
                    </div>
                    <Switch
                        checked={settings.minimalHud}
                        onChange={(checked) => saveSettings({ ...settings, minimalHud: checked })}
                        aria-label={t('settings.minimal_hud.title')}
                    />
                </div>

                {settings.minimalHud && (
                    <div>
                        <p className="field-label mb-2.5">{t('settings.minimal_hud.position.title')}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {POSITIONS.map(position => {
                                const active = (settings.minimalHudPosition ?? 'bottom-right') === position;
                                return (
                                    <button
                                        key={position}
                                        onClick={() => saveSettings({ ...settings, minimalHudPosition: position })}
                                        className={cn(
                                            'flex items-center gap-3 p-2.5 rounded-lg border text-left',
                                            'transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98]',
                                            active
                                                ? 'border-ember/50 bg-ember/15'
                                                : 'border-ink-3/50 hover:border-ink-4/70 hover:bg-ink-3/30',
                                        )}
                                    >
                                        <span className="relative w-9 h-7 rounded-md bg-ink-1 border border-ink-3/50 shrink-0">
                                            <span
                                                className={cn(
                                                    'absolute w-3 h-2 rounded-[3px]',
                                                    active ? 'bg-ember' : 'bg-ink-4',
                                                    cornerClass[position],
                                                )}
                                            />
                                        </span>
                                        <span className={cn('text-xs font-semibold', active ? 'text-white' : 'text-bone-3')}>
                                            {t(positionLabelKey[position])}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {showFade && (
                    <div className="border-t border-ink-3/40 pt-4">
                        <p className="text-sm font-semibold text-white">{t('fade.title')}</p>
                        <p className="text-xs text-bone-4 mt-1 mb-4 leading-relaxed">{t('fade.description')}</p>

                        <div className="flex flex-col gap-4">
                            <FadeSlider
                                label={t('fade.out')}
                                value={fadeOut}
                                onCommit={(value) => saveSettings({ ...settings, fadeOut: value })}
                            />
                            <FadeSlider
                                label={t('fade.in')}
                                value={fadeIn}
                                onCommit={(value) => saveSettings({ ...settings, fadeIn: value })}
                            />
                        </div>
                    </div>
                )}

                <div className="border-t border-ink-3/40 pt-4">
                    <p className="field-label mb-3">{t('keyboard.title', { defaultValue: 'Shortcuts' })}</p>
                    <div className="flex flex-col gap-2 text-xs text-bone-3">
                        <div className="flex items-center justify-between">
                            <span>{t('keyboard.shortcut.toggle')}</span>
                            <Kbd>⇧K</Kbd>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>{t('keyboard.shortcut.forward')}</span>
                            <Kbd>⇧←→</Kbd>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>{t('keyboard.shortcut.volume')}</span>
                            <Kbd>⇧↑↓</Kbd>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsDialog;
