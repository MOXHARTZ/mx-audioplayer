"use client";

import { Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline, IoArrowBackOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Navigate, NavLink } from "react-router-dom";
import { useAppSelector } from "@/stores";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground, GradientButton, StyledInput } from "@/components/common";
import AccountSelector from "./AccountSelector";
import i18next from "i18next";
import { notification } from "@/utils/misc";
import { Account } from "@/utils/types";

type LoginMode = 'account-selector' | 'manual-login';

export default function LoginPage() {
    const { playlist, accounts } = useAppSelector(state => state.Main);
    const [loginMode, setLoginMode] = useState<LoginMode>('account-selector');
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleAccountSelect = async (account: Account) => {
        setIsLoading(true);

        const success = await fetchNui("login", {
            id: account.id
        });

        if (!success) {
            notification(i18next.t('login.invalid_username_or_password'), 'error');
            setIsLoading(false);
            return;
        }

        notification(i18next.t('login.login_successful'), 'success');
        setIsLoading(false);
    };

    const handleManualSubmit = async (formData: FormData) => {
        setIsLoading(true);
        const username = formData.get("username");
        const password = formData.get("password");
        const success = await fetchNui("login", { username, password });
        if (!success) {
            notification(i18next.t('login.invalid_username_or_password'), 'error');
            setIsLoading(false);
            return;
        }
        notification(i18next.t('login.login_successful'), 'success');
        setIsLoading(false);
    };

    const switchToManualLogin = () => {
        setLoginMode('manual-login');
    };

    const switchToAccountSelector = () => {
        setLoginMode('account-selector');
    };

    useEffect(() => {
        if (playlist) return;
        fetchNui('handleChangePage', { page: 'login' });
    }, []);

    if (playlist) return <Navigate to="/" />;

    return (
        <AnimatedBackground
            showLogo={true}
            logoSize="lg"
            title={i18next.t('login.title')}
            subtitle={i18next.t('login.subtitle')}
            icon={<IoMusicalNotesOutline className="text-rose-400" />}
        >
            <AnimatePresence mode="wait">
                {loginMode === 'account-selector' ? (
                    <motion.div
                        key="account-selector"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {accounts && accounts.length > 0 ? (
                            <AccountSelector
                                accounts={accounts}
                                onAccountSelect={handleAccountSelect}
                                onManualLogin={switchToManualLogin}
                            />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className="text-gray-400 text-lg">
                                    {i18next.t('login.no_saved_accounts')}
                                </div>
                                <GradientButton
                                    onClick={switchToManualLogin}
                                    className="h-12"
                                >
                                    {i18next.t('login.manual_login')}
                                </GradientButton>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="manual-login"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            onClick={switchToAccountSelector}
                            className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors"
                        >
                            <IoArrowBackOutline className="text-xl" />
                            <span className="text-sm font-medium">
                                {i18next.t('login.back_to_accounts')}
                            </span>
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Form className="grid grid-cols-2 gap-4" validationBehavior="native" action={handleManualSubmit}>
                                <StyledInput
                                    isRequired
                                    label={i18next.t('login.username')}
                                    name="username"
                                    placeholder={i18next.t('login.username_placeholder')}
                                    startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
                                    errorMessage={i18next.t('required')}
                                />

                                <StyledInput
                                    isRequired
                                    label={i18next.t('login.password')}
                                    name="password"
                                    placeholder={i18next.t('login.password_placeholder')}
                                    type={isVisible ? "text" : "password"}
                                    startIcon={<IoLockClosedOutline className="text-rose-400 text-xl" />}
                                    endIcon={
                                        <button type="button" onClick={toggleVisibility} className="text-rose-400 hover:text-rose-300 transition-colors">
                                            {isVisible ? (
                                                <IoEyeOff className="text-xl" />
                                            ) : (
                                                <IoEyeOutline className="text-xl" />
                                            )}
                                        </button>
                                    }
                                    errorMessage={i18next.t('required')}
                                />

                                <div className="col-span-2">
                                    <GradientButton
                                        type="submit"
                                        isLoading={isLoading}
                                        loadingText={i18next.t('login.sign_in_loading')}
                                        className="h-12"
                                    >
                                        {i18next.t('login.sign_in')}
                                    </GradientButton>
                                </div>
                            </Form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 py-2"
                        >
                            <Divider className="flex-1 bg-rose-500/20" />
                            <p className="shrink-0 text-tiny text-gray-400">{i18next.t('or')}</p>
                            <Divider className="flex-1 bg-rose-500/20" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-center"
                        >
                            <p className="text-gray-400 text-sm">
                                {i18next.t('login.need_to_create_account')}&nbsp;
                                <NavLink
                                    to="/register"
                                    className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                                >
                                    {i18next.t('login.sign_up')}
                                </NavLink>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatedBackground>
    );
}