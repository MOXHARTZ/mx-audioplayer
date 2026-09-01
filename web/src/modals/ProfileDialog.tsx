import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const ProfileDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const { t } = useTranslation();
    const user = useStore(s => s.user);
    const toast = useStore(s => s.toast);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = String(formData.get('username') ?? '').trim();
        const password = String(formData.get('password') ?? '');
        const avatar = String(formData.get('avatar') ?? '').trim();
        if (!username || !password) return;

        setLoading(true);
        const success = await fetchNui<boolean>('updateProfile', { username, password, avatar }, true);
        setLoading(false);
        if (!success) {
            toast(t('profile.update_failed'), 'error');
            return;
        }
        toast(t('profile.updated'), 'success');
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('profile.title')}
            description={t('profile.subtitle')}
            size="md"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    id="profile-username"
                    name="username"
                    label={t('profile.username')}
                    placeholder={t('profile.username_placeholder')}
                    defaultValue={user?.username}
                    minLength={2}
                    isRequired
                    autoComplete="off"
                />
                <Input
                    id="profile-password"
                    name="password"
                    label={t('profile.password')}
                    placeholder={t('profile.password_placeholder')}
                    type={showPassword ? 'text' : 'password'}
                    isRequired
                    autoComplete="off"
                    endIcon={
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="text-ink-4 hover:text-white transition-colors duration-150"
                            aria-label="toggle password"
                        >
                            {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                        </button>
                    }
                />
                <Input
                    id="profile-avatar"
                    name="avatar"
                    label={t('profile.avatar')}
                    placeholder={t('profile.avatar_placeholder')}
                    defaultValue={user?.avatar}
                    autoComplete="off"
                />
                <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-1">
                    {t('profile.update_account')}
                </Button>
            </form>
        </Modal>
    );
};

export default ProfileDialog;
