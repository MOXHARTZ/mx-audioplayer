import { useAppDispatch, useAppSelector } from "@/stores";
import { setSettings } from "@/stores/Main";
import { fetchNui } from "@/utils/fetchNui";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox, Switch, cn } from "@nextui-org/react";
import i18next from "i18next";
import { useCallback } from "react";

type SettingsProps = Readonly<{
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}>

export default function SettingsModal({ isOpen, onOpenChange }: SettingsProps) {
    const dispatch = useAppDispatch()
    const settings = useAppSelector(state => state.Main.settings)
    const save = useCallback(() => {
        fetchNui('saveSettings', settings)
    }, [settings])
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{i18next.t('settings.title')}</ModalHeader>
                        <ModalBody>
                            <Switch
                                onChange={(e) => dispatch(setSettings({ ...settings, minimalHud: e.target.checked }))}
                                isSelected={settings.minimalHud}
                                color="danger"
                                classNames={{
                                    base: cn(
                                        "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                                        "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                        "data-[selected=true]:border-danger",
                                    ),
                                    wrapper: "p-0 h-4 overflow-visible",
                                    thumb: cn("w-6 h-6 border-2 shadow-lg",
                                        "group-data-[hover=true]:border-danger",
                                        //selected
                                        "group-data-[selected=true]:ml-6",
                                        // pressed
                                        "group-data-[pressed=true]:w-7",
                                        "group-data-[selected]:group-data-[pressed]:ml-4",
                                    ),
                                }}
                            >
                                <div className="flex flex-col gap-1">
                                    <p className="text-medium">{i18next.t('settings.minimal_hud')}</p>
                                    <p className="text-tiny text-default-400">{i18next.t('settings.minimal_hud.description')}</p>
                                </div>
                            </Switch>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="default" variant="light" onPress={onClose}>
                                {i18next.t('modal.cancel')}
                            </Button>
                            <Button color="danger" onPress={() => {
                                save()
                                onClose();
                            }}>
                                {i18next.t('modal.confirm')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}