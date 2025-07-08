import { Button, Input, Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { IoLogoGithub, IoLogoDiscord, IoLogoTwitter } from "react-icons/io5";
import { useState, useEffect } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Navigate, NavLink } from "react-router-dom";
import { useAppSelector } from "@/stores";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import MX from "/mx.svg";

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
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-rose-900/20 relative overflow-hidden">
            <motion.div
                className="absolute inset-0 opacity-20 -z-50"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 40% 40%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute top-20 left-20 text-rose-400/30"
                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <IoMusicalNotesOutline size={24} />
            </motion.div>

            <motion.div
                className="absolute bottom-20 right-20 text-rose-400/30"
                animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                <IoMusicalNotesOutline size={20} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex w-full max-w-xl flex-col gap-6 rounded-2xl bg-black/40 border border-rose-500/20 px-8 pb-8 pt-8 shadow-2xl"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col items-center gap-3"
                >

                    <img src={MX} alt="MX" className="w-24 h-24 object-cover" />
                    <div className="text-center">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Sign in to your audio paradise</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Form className="grid grid-cols-2 gap-4" validationBehavior="native" action={handleSubmit}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Input
                                isRequired
                                label="Username"
                                name="username"
                                placeholder="Enter your username"
                                variant="bordered"
                                classNames={{
                                    input: "bg-black/20 border-rose-500/30 text-white placeholder:text-gray-500",
                                    label: "text-gray-300",
                                    inputWrapper: "bg-black/20 border-rose-500/30 hover:border-rose-400/50 focus-within:border-rose-400"
                                }}
                                startContent={
                                    <IoPersonOutline className="text-rose-400 text-xl" />
                                }
                            />
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Input
                                isRequired
                                endContent={
                                    <button type="button" onClick={toggleVisibility} className="text-rose-400 hover:text-rose-300 transition-colors">
                                        {isVisible ? (
                                            <IoEyeOff className="text-xl" />
                                        ) : (
                                            <IoEyeOutline className="text-xl" />
                                        )}
                                    </button>
                                }
                                label="Password"
                                name="password"
                                placeholder="Enter your password"
                                type={isVisible ? "text" : "password"}
                                variant="bordered"
                                classNames={{
                                    input: "bg-black/20 border-rose-500/30 text-white placeholder:text-gray-500",
                                    label: "text-gray-300",
                                    inputWrapper: "bg-black/20 border-rose-500/30 hover:border-rose-400/50 focus-within:border-rose-400"
                                }}
                                startContent={
                                    <IoLockClosedOutline className="text-rose-400 text-xl" />
                                }
                            />
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="col-span-2"
                        >
                            <Button
                                className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white font-semibold h-12 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
                                type="submit"
                                isLoading={isLoading}
                                spinner={
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                }
                            >
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </motion.div>
                    </Form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex items-center gap-4 py-2"
                >
                    <Divider className="flex-1 bg-rose-500/30" />
                    <p className="shrink-0 text-tiny text-gray-400">OR</p>
                    <Divider className="flex-1 bg-rose-500/30" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
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
            </motion.div>
        </div>
    );
}
