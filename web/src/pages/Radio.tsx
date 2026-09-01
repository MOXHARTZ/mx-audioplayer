import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IoPlaySharp, IoRadioOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import CoverImage from '@/components/CoverImage';

const Radio = () => {
    const { t } = useTranslation();
    const stations = useStore(s => s.stations);
    const currentSong = useStore(s => s.currentSong);
    const playing = useStore(s => s.playing);
    const waiting = useStore(s => s.waiting);
    const playStation = useStore(s => s.playStation);

    return (
        <div className="w-full h-full overflow-y-auto scroll-thin px-7 py-6">
            <div className="mb-7 page-title pr-[var(--chrome-gutter)]">
                <h1 className="white-title">{t('station.title')}</h1>
                <p className="page-meta mt-1.5">{t('station.subtitle')}</p>
            </div>

            {stations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <IoRadioOutline size={40} className="text-ink-4 mb-4" />
                    <p className="text-sm text-bone-4">{t('station.empty')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stations.map((station, index) => {
                        const isCurrent = currentSong?.id === station.id;
                        return (
                            <button
                                key={station.id}
                                disabled={waiting}
                                style={{ '--stagger': `${Math.min(index * 40, 300)}ms` } as React.CSSProperties}
                                onClick={() => playStation(station)}
                                className={cn(
                                    'fade-up card-tile group p-3 text-left disabled:opacity-50',
                                    isCurrent && 'border-ember/50',
                                )}
                            >
                                <div className="relative mb-3">
                                    <CoverImage
                                        src={station.cover}
                                        alt={station.title}
                                        className="w-full aspect-square rounded-lg object-cover border border-ink-3/40"
                                        fallbackClassName="w-full aspect-square rounded-lg border border-ink-3/40"
                                    />
                                    {isCurrent && playing ? (
                                        <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1">
                                            <span className="flex items-end gap-[2px] h-3" aria-hidden>
                                                <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                                                <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                                                <span className="eq-bar w-[3px] h-full rounded-sm bg-brass" />
                                            </span>
                                            <span className="text-[10px] font-bold tracking-[0.14em] text-brass">
                                                {t('station.live')}
                                            </span>
                                        </span>
                                    ) : (
                                        <span
                                            className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-primary-glow
                                                flex items-center justify-center
                                                opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
                                                transition-[opacity,transform] duration-200 ease-out"
                                        >
                                            <IoPlaySharp size={17} className="ml-0.5" />
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-semibold text-white truncate">{station.title}</p>
                                <p className="text-xs text-bone-4 truncate mt-0.5">{station.artist}</p>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default memo(Radio);
