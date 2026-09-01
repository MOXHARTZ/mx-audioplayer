import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs } from '@heroui/react';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import type { GtaPlayer, Playlist } from '@/types';

interface ShareDialogProps {
    open: boolean;
    onClose: () => void;
    playlist?: Playlist;
}

const NearbyTab = ({ playlist, onClose }: { playlist?: Playlist; onClose: () => void }) => {
    const { t } = useTranslation();
    const toast = useStore(s => s.toast);
    const [players, setPlayers] = useState<GtaPlayer[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchNui<GtaPlayer[]>('getNearbyPlayers', undefined, [
            { name: 'Ayla Vural', source: 3, distance: 2.1 },
            { name: 'Deniz Aksoy', source: 8, distance: 5.6 },
        ]).then((result) => {
            if (cancelled) return;
            setPlayers(result ?? []);
        });
        return () => { cancelled = true; };
    }, []);

    const handleShare = (player: GtaPlayer) => {
        fetchNui('sharePlaylist', { player: +player.source, playlist });
        toast(t('shared.success'), 'success');
        onClose();
    };

    if (!players) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner className="text-bone-3" />
            </div>
        );
    }

    if (players.length === 0) {
        return <p className="py-8 text-center text-sm text-bone-4">{t('shared.no_players')}</p>;
    }

    return (
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto scroll-thin">
            {players.map(player => (
                <button
                    key={player.source}
                    onClick={() => handleShare(player)}
                    className="row-tile flex items-center gap-3 p-2.5 text-left"
                >
                    <IoPersonCircleOutline size={30} className="text-ink-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                            {player.name?.trim() || t('general.unknown')}
                        </p>
                        <p className="text-xs text-bone-4">#{player.source}</p>
                    </div>
                    {typeof player.distance === 'number' && (
                        <span className="text-xs text-bone-4 tabular-nums shrink-0">
                            {player.distance.toFixed(1)}m
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

const CodeTab = ({ playlist }: { playlist?: Playlist }) => {
    const { t } = useTranslation();
    const toast = useStore(s => s.toast);
    const [code, setCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        if (!playlist || loading) return;
        setLoading(true);
        const result = await fetchNui<string | false>('createShareCode', { playlistId: playlist.id }, 'AB34XY');
        setLoading(false);
        if (!result) {
            toast(t('share.failed'), 'error');
            return;
        }
        setCode(result);
    };

    return (
        <div className="flex flex-col items-center gap-4 py-2">
            {code ? (
                <p className="select-text font-mono text-3xl font-extrabold tracking-[0.3em] text-brass">
                    {code}
                </p>
            ) : (
                <Button variant="primary" loading={loading} onPress={generate}>
                    {loading ? t('share.generating') : t('share.generate')}
                </Button>
            )}
            <p className="text-xs text-bone-4 text-center leading-relaxed max-w-xs">
                {t('share.code_hint')}
            </p>
        </div>
    );
};

const ShareDialog = ({ open, onClose, playlist }: ShareDialogProps) => {
    const { t } = useTranslation();

    return (
        <Modal open={open} onClose={onClose} title={t('shared.title')} description={playlist?.name} size="sm">
            <Tabs
                aria-label={t('shared.title')}
                variant="bordered"
                fullWidth
                classNames={{
                    tabList: 'border-ink-3/50 bg-ink-1/60',
                    cursor: 'bg-ember/25 border border-ember/50',
                    tab: 'text-bone-3 data-[selected=true]:text-white text-xs font-semibold',
                }}
            >
                <Tab key="nearby" title={t('share.tab_nearby')}>
                    {open && <NearbyTab playlist={playlist} onClose={onClose} />}
                </Tab>
                <Tab key="code" title={t('share.tab_code')}>
                    {open && <CodeTab playlist={playlist} />}
                </Tab>
            </Tabs>
        </Modal>
    );
};

export default ShareDialog;
