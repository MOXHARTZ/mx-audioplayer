"use client";

import { Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Navigate, NavLink } from "react-router-dom";
import { useAppSelector } from "@/stores";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AnimatedBackground, GradientButton, StyledInput } from "@/components/common";

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
            toast.error("Invalid username or password");
            setIsLoading(false);
            return;
        }
        toast.success("Login successful");
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
            title="Welcome Back"
            subtitle="Sign in to your audio paradise"
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
                        label="Username"
                        name="username"
                        placeholder="Enter your username"
                        startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
                    />

                    <StyledInput
                        isRequired
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
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
                            loadingText="Signing In..."
                            className="h-12"
                        >
                            Sign In
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
                <p className="shrink-0 text-tiny text-gray-400">OR</p>
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
                    Need to create an account?&nbsp;
                    <NavLink
                        to="/register"
                        className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                        Sign Up
                    </NavLink>
                </p>
            </motion.div>
        </AnimatedBackground>
    );
}
