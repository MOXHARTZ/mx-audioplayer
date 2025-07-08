"use client";

import { Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Navigate, NavLink } from "react-router-dom";
import { useAppSelector } from "@/stores";
import { motion } from "framer-motion";
import { AnimatedBackground, GradientButton, StyledInput } from "@/components/common";
import i18next from "i18next";
import { notification } from "@/utils/misc";

export default function LoginPage() {
    const { playlist } = useAppSelector(state => state.Main)
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        const username = formData.get("username");
        const password = formData.get("password");
        const success = await fetchNui("login", { username, password });
        if (!success) {
            notification(i18next.t('login.invalid_username_or_password'), 'error')
            setIsLoading(false);
            return;
        }
        notification(i18next.t('login.login_successful'), 'success')
        setIsLoading(false);
    };

    useEffect(() => {
        if (playlist) return;
        fetchNui('handleChangePage', { page: 'login' })
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 20,
                    delay: 0.4
                }}
            >
                <Form className="grid grid-cols-2 gap-4" validationBehavior="native" action={handleSubmit}>
                    <StyledInput
                        isRequired
                        label={i18next.t('login.username')}
                        name="username"
                        placeholder={i18next.t('login.username_placeholder')}
                        startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
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
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    delay: 0.6
                }}
                className="flex items-center gap-4 py-2"
            >
                <Divider className="flex-1 bg-rose-500/30" />
                <p className="shrink-0 text-tiny text-gray-400">{i18next.t('or')}</p>
                <Divider className="flex-1 bg-rose-500/30" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 20,
                    delay: 1
                }}
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
        </AnimatedBackground>
    );
}
