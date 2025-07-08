import { Button, Input, Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { useState } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import MX from "/mx.svg";

export default function RegisterPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const navigate = useNavigate()

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        const username = formData.get("username");
        const password = formData.get("password");
        const firstname = formData.get("firstname");
        const lastname = formData.get("lastname");
        const success = await fetchNui("register", { username, password, firstname, lastname });
        if (!success) {
            toast.error("Registration failed");
            setIsLoading(false);
            return;
        }
        toast.success("Registration successful");
        setIsLoading(false);
        navigate("/login")
    };

    return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-rose-900/20 relative overflow-hidden">
            <motion.div
                className="absolute inset-0 opacity-20 -z-50"
                animate={{
                    background: [
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
                className="absolute top-32 left-32 text-rose-400/30"
                animate={{ y: [0, -25, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <IoMusicalNotesOutline size={28} />
            </motion.div>

            <motion.div
                className="absolute bottom-32 right-32 text-rose-400/30"
                animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
                <IoMusicalNotesOutline size={24} />
            </motion.div>

            <motion.div
                className="absolute top-1/2 left-1/4 text-rose-400/20"
                animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
                            Join the Music
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Create your account and start your journey</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Form className="grid grid-cols-2 gap-4" validationBehavior="native" action={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Input
                                    isRequired
                                    label="First Name"
                                    name="firstname"
                                    placeholder="Enter your first name"
                                    variant="bordered"
                                    minLength={2}
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
                                    label="Last Name"
                                    name="lastname"
                                    placeholder="Enter your last name"
                                    variant="bordered"
                                    minLength={2}
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
                        </div>
                        <div className="flex flex-col gap-4">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Input
                                    fullWidth
                                    isRequired
                                    label="Username"
                                    name="username"
                                    placeholder="Choose a unique username"
                                    variant="bordered"
                                    minLength={2}
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
                                    placeholder="Create a strong password"
                                    type={isVisible ? "text" : "password"}
                                    variant="bordered"
                                    minLength={6}
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
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="col-span-2"
                        >
                            <Button
                                fullWidth
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
                                {isLoading ? "Creating Account..." : "Create Account"}
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
                        Already have an account?&nbsp;
                        <NavLink
                            to="/login"
                            className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                        >
                            Log In
                        </NavLink>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}
