import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { isEmpty, nanoid } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import PlaylistCover from '@/components/PlaylistCover';
import type { Playlist } from '@/types';

interface PlaylistDialogProps {
    open: boolean;
    onClose: () => void;
    playlist?: Playlist;
}

const PlaylistDialog = ({ open, onClose, playlist }: PlaylistDialogProps) => {
    const { t } = useTranslation();
    const addPlaylist = useStore(s => s.addPlaylist);
    const updatePlaylist = useStore(s => s.updatePlaylist);
    const toast = useStore(s => s.toast);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        if (open) {
            setName(playlist?.name ?? '');
            setDescription(playlist?.description ?? '');
            setImage(playlist?.thumbnail ?? '');
        }
    }, [open, playlist]);

    const handleSave = () => {
        if (!name.trim()) {
            toast(`${t('playlist.dialog.name')} ${t('required')}`, 'error');
            return;
        }
        if (playlist) {
            updatePlaylist({
                ...playlist,
                name: name.trim(),
                description,
                thumbnail: isEmpty(image) ? undefined : image,
            });
        } else {
            addPlaylist({
                id: nanoid(),
                name: name.trim(),
                description,
                thumbnail: isEmpty(image) ? undefined : image,
                songs: [],
            });
        }
        toast(t('playlist.dialog.created'), 'success');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={playlist ? t('playlist.dialog.edit') : t('playlist.dialog.create')}
            size="lg"
        >
            <div className="grid grid-cols-[160px_1fr] gap-5">
                <PlaylistCover playlist={playlist} url={image} className="w-40 h-40" rounded="rounded-xl" />
                <div className="flex flex-col gap-4">
                    <Input
                        autoFocus
                        id="playlist-name"
                        label={t('playlist.dialog.name')}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoComplete="off"
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                    />
                    <Input
                        id="playlist-image"
                        label={t('playlist.dialog.image_url')}
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        autoComplete="off"
                    />
                    <Textarea
                        id="playlist-description"
                        label={t('playlist.dialog.description')}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        minRows={2}
                        maxLength={500}
                    />
                </div>
            </div>
            <div className="flex gap-3 mt-6">
                <Button variant="outline" fullWidth onPress={onClose}>
                    {t('general.cancel')}
                </Button>
                <Button variant="primary" fullWidth onPress={handleSave}>
                    {t('general.done')}
                </Button>
            </div>
        </Modal>
    );
};

export default PlaylistDialog;
