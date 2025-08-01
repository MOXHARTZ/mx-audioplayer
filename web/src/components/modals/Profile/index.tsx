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
                        <ModalHeader className="flex flex-col gap-1">{i18next.t('profile.title')}</ModalHeader>
                        <ModalBody>
                            <Form className="flex flex-col gap-3" validationBehavior="native" action={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Input
                                        isRequired
                                        label={i18next.t('profile.username')}
                                        name="username"
                                        placeholder={i18next.t('profile.username_placeholder')}
                                        defaultValue={userData?.username}
                                        variant="faded"
                                        minLength={2}
                                        errorMessage={i18next.t('required')}
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
                                        label={i18next.t('profile.password')}
                                        name="password"
                                        placeholder={i18next.t('profile.password_placeholder')}
                                        type={isVisible ? "text" : "password"}
                                        variant="faded"
                                        errorMessage={i18next.t('required')}
                                    />
                                    <Input
                                        label={i18next.t('profile.avatar')}
                                        name="avatar"
                                        placeholder={i18next.t('profile.avatar_placeholder')}
                                        className="col-span-2"
                                        defaultValue={userData?.avatar}
                                        type='text'
                                        validate={(value) => {
                                            if (!value) return true;
                                            return true;
                                        }}
                                        variant="faded"
                                        errorMessage={i18next.t('required')}
                                    />
                                </div>
                                <footer className="flex flex-row w-full gap-3">
                                    <Button className="w-full mb-3" color="danger">
                                        {i18next.t('profile.delete_account')}
                                    </Button>
                                    <Button className="w-full mb-3" color="primary" type="submit">
                                        {i18next.t('profile.update_account')}
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