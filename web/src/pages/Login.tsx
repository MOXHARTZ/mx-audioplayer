import { FormEvent, useEffect, useState } from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Avatar } from '@heroui/react';
import {
    IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline,
    IoPersonOutline, IoArrowBackOutline, IoChevronForwardOutline,
} from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import AuthLayout from './AuthLayout';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Account } from '@/types';

const LoginPage = () => {
    const { t } = useTranslation();
    const playlists = useStore(s => s.playlists);
    const accounts = useStore(s => s.accounts);
    const toast = useStore(s => s.toast);

    const [manual, setManual] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (playlists) return;
        fetchNui('handleChangePage', { page: 'login' });
    }, [playlists]);

    if (playlists) return <Navigate to="/" replace />;

    const loginWithAccount = async (account: Account) => {
        if (loading) return;
        setLoading(true);
        const token = await fetchNui<string | false>('login', { id: account.id }, false);
        setLoading(false);
        if (!token) {
            toast(t('login.invalid_username_or_password'), 'error');
            return;
        }
        toast(t('login.login_successful'), 'success');
    };

    const loginManual = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return;
        const formData = new FormData(e.currentTarget);
        const username = String(formData.get('username') ?? '').trim();
        const password = String(formData.get('password') ?? '');
        if (!username || !password) return;
        setLoading(true);
        const token = await fetchNui<string | false>('login', { username, password }, false);
        setLoading(false);
        if (!token) {
            toast(t('login.invalid_username_or_password'), 'error');
            return;
        }
        toast(t('login.login_successful'), 'success');
    };

    const showSelector = !manual && accounts.length > 0;

    return (
        <AuthLayout
            title={t('login.title')}
            subtitle={showSelector ? t('login.select_account_subtitle') : t('login.subtitle')}
        >
            <AnimatePresence mode="wait" initial={false}>
                {showSelector ? (
                    <motion.div
                        key="selector"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                        className="flex flex-col gap-3"
                    >
                        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto scroll-thin -mx-1 px-1">
                            {accounts.map(account => (
                                <button
                                    key={account.id ?? account.username}
                                    onClick={() => loginWithAccount(account)}
                                    disabled={loading}
                                    className="row-tile flex items-center gap-3 p-3 text-left disabled:opacity-50"
                                >
                                    <Avatar
                                        size="sm"
                                        src={account.avatar}
                                        name={(account.firstname ?? account.username).charAt(0).toUpperCase()}
                                        classNames={{
                                            base: 'bg-ink-2 border border-ink-3/60 w-10 h-10 shrink-0',
                                            name: 'text-sm font-bold text-bone-2',
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {account.firstname} {account.lastname}
                                        </p>
                                        <p className="text-xs text-bone-4 truncate">@{account.username}</p>
                                    </div>
                                    <IoChevronForwardOutline className="text-ink-4 shrink-0" />
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" fullWidth onPress={() => setManual(true)}>
                            {t('login.manual_login')}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="manual"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    >
                        {accounts.length > 0 && (
                            <button
                                onClick={() => setManual(false)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-bone-3 hover:text-white transition-colors duration-150 mb-5"
                            >
                                <IoArrowBackOutline size={14} />
                                {t('login.back_to_accounts')}
                            </button>
                        )}
                        <form onSubmit={loginManual} className="flex flex-col gap-4">
                            <Input
                                id="login-username"
                                name="username"
                                label={t('login.username')}
                                placeholder={t('login.username_placeholder')}
                                startIcon={<IoPersonOutline size={16} />}
                                isRequired
                                autoComplete="off"
                            />
                            <Input
                                id="login-password"
                                name="password"
                                label={t('login.password')}
                                placeholder={t('login.password_placeholder')}
                                type={showPassword ? 'text' : 'password'}
                                startIcon={<IoLockClosedOutline size={16} />}
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
                                {t('login.sign_in')}
                            </Button>
                        </form>
                        <p className="text-center text-xs text-bone-4 mt-6">
                            {t('login.need_to_create_account')}{' '}
                            <NavLink to="/register" className="text-brass font-semibold hover:text-brass-2 transition-colors duration-150">
                                {t('login.sign_up')}
                            </NavLink>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};

export default LoginPage;
