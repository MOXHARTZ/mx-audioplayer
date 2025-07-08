import { useAppDispatch, useAppSelector } from "@/stores";
import { setSettings, setUserData } from "@/stores/Main";
import { fetchNui } from "@/utils/fetchNui";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox, Switch, cn, Form, Input } from "@heroui/react";
import i18next from "i18next";
import { useCallback, useState } from "react";
import { Account, Settings } from "@/utils/types";
import { IoEyeOff, IoEyeOutline } from "react-icons/io5";
import { notification } from "@/utils/misc";

type ProfileProps = Readonly<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userData: Account | undefined;
}>

export default function ProfileModal({ isOpen, onOpenChange, userData }: ProfileProps) {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(state => state.Main.settings)
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const handleSubmit = async (formData: FormData) => {
        const username = formData.get("username");
        const password = formData.get("password");
        const avatar = formData.get("avatar");
        const success = await fetchNui("updateProfile", { username, password, avatar });
        if (!success) {
            notification("Update failed", 'error')
            return;
        }
        notification("Profile updated successfully. Please open the ui again.", 'success')
        onOpenChange(false)
    };
    return (
        <Modal isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Manage Account</ModalHeader>
                        <ModalBody>
                            <Form className="flex flex-col gap-3" validationBehavior="native" action={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Input
                                        isRequired
                                        label="New Username"
                                        name="username"
                                        placeholder="Update your username"
                                        defaultValue={userData?.username}
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
                                        label="New Password"
                                        name="password"
                                        placeholder="Enter your password"
                                        type={isVisible ? "text" : "password"}
                                        variant="faded"
                                    />
                                    <Input
                                        label="Avatar Url"
                                        name="avatar"
                                        placeholder="Enter your avatar URL"
                                        className="col-span-2"
                                        defaultValue={userData?.avatar}
                                        type='text'
                                        validate={(value) => {
                                            if (!value) return true;
                                            if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(value)) {
                                                return "Invalid URL format. Please enter a valid image URL.";
                                            }
                                            return true;
                                        }}
                                        variant="faded"
                                    />
                                </div>
                                <footer className="flex flex-row w-full gap-3">
                                    <Button className="w-full mb-3" color="danger">
                                        Delete Account
                                    </Button>
                                    <Button className="w-full mb-3" color="primary" type="submit">
                                        Update Account
                                    </Button>
                                </footer>

                            </Form>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}