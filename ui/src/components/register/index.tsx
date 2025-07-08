"use client";

import { Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline, IoPersonOutline, IoLockClosedOutline, IoMusicalNotesOutline } from "react-icons/io5";
import { useState, useActionState } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { AnimatedBackground, GradientButton, StyledInput } from "@/components/common";

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
        <AnimatedBackground
            showLogo={true}
            logoSize="lg"
            title="Join the Music"
            subtitle="Create your account and start your journey"
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
                    <div className="flex flex-col gap-4">
                        <StyledInput
                            isRequired
                            label="First Name"
                            name="firstname"
                            placeholder="Enter your first name"
                            minLength={2}
                            startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
                        />

                        <StyledInput
                            isRequired
                            label="Last Name"
                            name="lastname"
                            placeholder="Enter your last name"
                            minLength={2}
                            startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <StyledInput
                            fullWidth
                            isRequired
                            label="Username"
                            name="username"
                            placeholder="Choose a unique username"
                            minLength={2}
                            startIcon={<IoPersonOutline className="text-rose-400 text-xl" />}
                        />

                        <StyledInput
                            isRequired
                            label="Password"
                            name="password"
                            placeholder="Create a strong password"
                            type={isVisible ? "text" : "password"}
                            minLength={6}
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
                    </div>

                    <div className="col-span-2">
                        <GradientButton
                            type="submit"
                            isLoading={isLoading}
                            loadingText="Creating Account..."
                            className="h-12"
                        >
                            Create Account
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
                    Already have an account?&nbsp;
                    <NavLink
                        to="/login"
                        className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                    >
                        Log In
                    </NavLink>
                </p>
            </motion.div>
        </AnimatedBackground>
    );
}
