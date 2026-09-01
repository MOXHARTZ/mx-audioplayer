import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoKeyOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import { nanoid } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Playlist } from '@/types';

const RedeemDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { t } = useTranslation();
    const playlists = useStore(s => s.playlists);
    const persistPlaylists = useStore(s => s.persistPlaylists);
    const toast = useStore(s => s.toast);

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    const close = () => {
        setCode('');
        onClose();
    };

    const submit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = code.trim().toUpperCase();
        if (!trimmed || loading) return;

        setLoading(true);
        const shared = await fetchNui<Omit<Playlist, 'id'> | false>(
            'redeemShareCode',
            { code: trimmed },
            { name: 'Shared playlist', songs: [] },
        );
        setLoading(false);

        if (!shared) {
            toast(t('share.invalid'), 'error');
            return;
        }
        persistPlaylists([...(playlists ?? []), { ...shared, id: nanoid() }]);
        toast(t('share.redeemed'), 'success');
        close();
    };

    return (
        <Modal
            open={open}
            onClose={close}
            title={t('share.redeem_title')}
            description={t('share.redeem_subtitle')}
            size="sm"
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                <Input
                    autoFocus
                    id="share-code"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder={t('share.redeem_placeholder')}
                    startIcon={<IoKeyOutline size={16} />}
                    maxLength={6}
                    autoComplete="off"
                    classNames={{ input: 'font-mono tracking-[0.3em] uppercase' }}
                />
                <Button type="submit" variant="primary" fullWidth loading={loading} disabled={code.trim().length < 6}>
                    {t('share.redeem')}
                </Button>
            </form>
        </Modal>
    );
};

export default RedeemDialog;
