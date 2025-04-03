"use client";

import { Button, Input, Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline } from "react-icons/io5";
import { useState, useEffect } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { Navigate, NavLink } from "react-router-dom";
import { useAppSelector } from "@/stores";
import { toast } from "react-toastify";

export default function LoginPage() {
    const { playlist } = useAppSelector(state => state.Main)
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleSubmit = async (formData: FormData) => {
        const username = formData.get("username");
        const password = formData.get("password");
        const success = await fetchNui("login", { username, password });
        if (!success) {
            toast.error("Invalid username or password");
            return;
        }
        toast.success("Login successful");
    };

    useEffect(() => {
        if (playlist) return;
        fetchNui('handleChangePage', { page: 'login' })
    }, []);

    if (playlist) return <Navigate to="/" />;

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
                <div className="flex flex-col gap-1">
                    <h1 className="text-large font-medium">Sign in to your account</h1>
                </div>
                <Form className="flex flex-col gap-3" validationBehavior="native" action={handleSubmit}>
                    <Input
                        isRequired
                        label="Username"
                        name="username"
                        placeholder="Enter your username"
                        variant="faded"
                    />
                    <Input
                        isRequired
                        endContent={
                            <button type="button" onClick={toggleVisibility}>
                                {isVisible ? (
                                    <IoEyeOff className="pointer-events-none text-2xl text-default-400" />
                                ) : (
                                    <IoEyeOutline className="pointer-events-none text-2xl text-default-400" />
                                )}
                            </button>
                        }
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        type={isVisible ? "text" : "password"}
                        variant="faded"
                    />
                    <Button className="w-full" color="primary" type="submit">
                        Sign In
                    </Button>
                </Form>
                <div className="flex items-center gap-4 py-2">
                    <Divider className="flex-1" />
                    <p className="shrink-0 text-tiny text-default-500">OR</p>
                    <Divider className="flex-1" />
                </div>
                <p className="text-center text-small">
                    Need to create an account?&nbsp;
                    <NavLink to="/register" className='!text-pink-600 text-sm'>
                        Sign Up
                    </NavLink>
                </p>
            </div>
        </div>
    );
}
