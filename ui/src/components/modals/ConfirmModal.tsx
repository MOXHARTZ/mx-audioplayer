import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import i18next from "i18next";

type ConfirmProps = {
    isOpen: boolean;
    handleConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
};

export default function ConfirmModal({ title, children, confirmText, cancelText, isOpen, handleConfirm, onOpenChange }: ConfirmProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
                        <ModalBody>
                            {children}
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                {cancelText ?? i18next.t('modal.cancel')}
                            </Button>
                            <Button color="primary" onPress={() => {
                                handleConfirm();
                                onClose();
                            }}>
                                {confirmText ?? i18next.t('modal.confirm')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}