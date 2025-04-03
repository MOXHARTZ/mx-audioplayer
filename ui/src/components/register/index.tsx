"use client";

import { Button, Input, Checkbox, Link, Form, Divider } from "@heroui/react";
import { IoEyeOff, IoEyeOutline } from "react-icons/io5";
import { useState, useActionState } from "react";
import { fetchNui } from "@/utils/fetchNui";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function RegisterPage() {
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const navigate = useNavigate()

    const handleSubmit = async (formData: FormData) => {
        const username = formData.get("username");
        const password = formData.get("password");
        const firstname = formData.get("firstname");
        const lastname = formData.get("lastname");
        const success = fetchNui("register", { username, password, firstname, lastname });
        if (!success) {
            toast.error("Registration failed");
            return;
        }
        toast.success("Registration successful");
        navigate("/login")
    };

    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-md flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
                <div className="flex flex-col gap-1">
                    <h1 className="text-large font-medium">Lets create a new account</h1>
                    <p className="text-default-500 text-small">Please fill in the form to create a new account</p>
                </div>
                <Form className="flex flex-col gap-3" validationBehavior="native" action={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            isRequired
                            label="Username"
                            name="username"
                            placeholder="Enter your username"
                            variant="faded"
                            minLength={2}
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
                            minLength={2}
                        />
                        <Input
                            minLength={2}
                            isRequired
                            label="First Name"
                            name="firstname"
                            placeholder="Enter your first name"
                            variant="faded"
                        />
                        <Input
                            minLength={2}
                            isRequired
                            label="Last Name"
                            name="lastname"
                            placeholder="Enter your last name"
                            variant="faded"
                        />
                    </div>
                    <Button className="w-full" color="danger" type="submit">
                        Sign Up
                    </Button>
                </Form>
                <div className="flex items-center gap-4 py-2">
                    <Divider className="flex-1" />
                    <p className="shrink-0 text-tiny text-default-500">OR</p>
                    <Divider className="flex-1" />
                </div>
                <p className="text-center text-small">
                    Already have an account??&nbsp;
                    <NavLink to="/login" className="!text-blue-500 text-sm">
                        Log In
                    </NavLink>
                </p>
            </div>
        </div>
    );
}
