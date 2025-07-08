import { useAppDispatch, useAppSelector } from "@/stores";
import { setSettings } from "@/stores/Main";
import { fetchNui } from "@/utils/fetchNui";
import { Modal, ModalContent, Button, Switch, cn } from "@heroui/react";
import { IoSettingsOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import i18next from "i18next";
import { useCallback } from "react";
import MinimalHudPositionTabs from "./Positions";
import { Settings } from "@/utils/types";
import MX from "/mx.svg";

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
    const updateSettings = useCallback((key: keyof Settings, value: any) => {
        dispatch(setSettings({ ...settings, [key]: value }))
    }, [settings])

    return (
        <Modal isOpen={isOpen} size="2xl" onOpenChange={onOpenChange} classNames={{
            backdrop: "bg-black/80 backdrop-blur-sm",
            base: "bg-transparent shadow-none",
            wrapper: "bg-transparent"
        }}>
            <ModalContent>
                {(onClose) => (
                    <div className="relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-rose-900/20"
                            animate={{
                                background: [
                                    "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                    "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                                ]
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 20
                            }}
                            className="flex w-full flex-col gap-6 rounded-2xl bg-black/40 border border-rose-500/20 p-8 shadow-2xl backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    delay: 0.2
                                }}
                                className="flex flex-col items-center gap-4"
                            >
                                <motion.div
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-white-500 to-rose-500 p-2 flex items-center justify-center shadow-lg shadow-rose-500/25"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 25px rgba(244, 63, 94, 0.4)",
                                        transition: { type: "spring", stiffness: 300, damping: 20 }
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                        transition: { type: "spring", stiffness: 400, damping: 15 }
                                    }}
                                >
                                    <img src={MX} alt="MX" className="w-full h-full object-cover rounded-full mt-1" />
                                </motion.div>
                                <div className="text-center flex flex-col items-center justify-center">
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent flex items-center gap-2">
                                        <IoSettingsOutline className="text-rose-400" />
                                        {i18next.t('settings.title')}
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">Customize your audio experience</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    delay: 0.4
                                }}
                                className="space-y-6"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-rose-500/20 hover:border-rose-400/40 transition-all duration-400 ease-out"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-white font-medium">{i18next.t('settings.minimal_hud')}</p>
                                        <p className="text-gray-400 text-sm">{i18next.t('settings.minimal_hud.description')}</p>
                                    </div>
                                    <Switch
                                        onChange={(e) => updateSettings('minimalHud', e.target.checked)}
                                        isSelected={settings.minimalHud}
                                        color="danger"
                                        classNames={{
                                            base: cn(
                                                "inline-flex flex-row-reverse bg-black/30 border-rose-500/30 hover:border-rose-400/50",
                                                "items-center justify-between cursor-pointer rounded-lg gap-2 p-2 border-2",
                                                "data-[selected=true]:border-rose-400 data-[selected=true]:bg-rose-500/20",
                                            ),
                                            wrapper: "p-0 overflow-visible",
                                            thumb: cn("w-5 h-5 border-2 shadow-lg",
                                                "group-data-[hover=true]:border-rose-400",
                                                "group-data-[selected=true]:ml-5",
                                                "group-data-[pressed=true]:w-6",
                                                "group-data-[selected]:group-data-[pressed]:ml-4",
                                            ),
                                        }}
                                    />
                                </motion.div>

                                <motion.div
                                    initial={false}
                                    animate={{
                                        opacity: settings.minimalHud ? 1 : 0,
                                        scale: settings.minimalHud ? 1 : 0.98,
                                        y: settings.minimalHud ? 0 : -5
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        duration: 0.4
                                    }}
                                    className={`overflow-hidden transition-all duration-500 ease-out ${settings.minimalHud
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                        }`}
                                >
                                    <div className="p-4 rounded-xl bg-black/20 border border-rose-500/20">
                                        <MinimalHudPositionTabs position={settings.minimalHudPosition} updateSettings={updateSettings} />
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    delay: 0.6
                                }}
                                className="flex gap-3 pt-4"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                    className="flex-1"
                                >
                                    <Button
                                        fullWidth
                                        color="default"
                                        variant="bordered"
                                        onPress={onClose}
                                        className="bg-black/20 border-rose-500/30 text-white hover:border-rose-400/50 hover:bg-black/30 transition-all duration-300"
                                    >
                                        {i18next.t('modal.cancel')}
                                    </Button>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                    className="flex-1"
                                >
                                    <Button
                                        fullWidth
                                        className="bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
                                        onPress={() => {
                                            save()
                                            onClose();
                                        }}
                                    >
                                        {i18next.t('modal.confirm')}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </ModalContent>
        </Modal>
    );
}