import { FormEvent, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoPersonOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import AuthLayout from './AuthLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const RegisterPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useStore(s => s.toast);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        const formData = new FormData(e.currentTarget);
        const payload = {
            firstname: String(formData.get('firstname') ?? '').trim(),
            lastname: String(formData.get('lastname') ?? '').trim(),
            username: String(formData.get('username') ?? '').trim(),
            password: String(formData.get('password') ?? ''),
        };
        if (!payload.firstname || !payload.lastname || !payload.username || !payload.password) return;

        setLoading(true);
        const success = await fetchNui<boolean>('register', payload, true);
        setLoading(false);
        if (!success) {
            toast(t('register.registration_failed'), 'error');
            return;
        }
        toast(t('register.registration_successful'), 'success');
        navigate('/login');
    };

    return (
        <AuthLayout title={t('register.title')} subtitle={t('register.subtitle')}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        id="register-firstname"
                        name="firstname"
                        label={t('register.firstname')}
                        placeholder={t('register.firstname_placeholder')}
                        minLength={2}
                        isRequired
                        autoComplete="off"
                    />
                    <Input
                        id="register-lastname"
                        name="lastname"
                        label={t('register.lastname')}
                        placeholder={t('register.lastname_placeholder')}
                        minLength={2}
                        isRequired
                        autoComplete="off"
                    />
                </div>
                <Input
                    id="register-username"
                    name="username"
                    label={t('register.username')}
                    placeholder={t('register.username_placeholder')}
                    startIcon={<IoPersonOutline size={16} />}
                    minLength={3}
                    isRequired
                    autoComplete="off"
                />
                <Input
                    id="register-password"
                    name="password"
                    label={t('register.password')}
                    placeholder={t('register.password_placeholder')}
                    type={showPassword ? 'text' : 'password'}
                    startIcon={<IoLockClosedOutline size={16} />}
                    minLength={6}
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
                <Button type="submit" variant="primary" fullWidth loading={loading}>
                    {t('register.sign_up')}
                </Button>
            </form>
            <p className="text-center text-xs text-bone-4 mt-6">
                {t('register.already_have_account')}{' '}
                <NavLink to="/login" className="text-brass font-semibold hover:text-brass-2 transition-colors duration-150">
                    {t('register.sign_in')}
                </NavLink>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;
