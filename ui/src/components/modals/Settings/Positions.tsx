import { RadioGroup, Radio, cn } from "@heroui/react";
import { MinimalHudPosition, Settings } from '@/utils/types';
import { DefaultMinimalHudPosition } from "@/utils/defaults";
import { motion } from "framer-motion";
import { IoLocationOutline } from "react-icons/io5";
import i18next from "i18next";

export const CustomRadio = (props: React.ComponentProps<typeof Radio>) => {
    const { children, ...otherProps } = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-black/20 border border-rose-500/20 hover:border-rose-400/40 hover:bg-black/30",
                    "flex flex-row-reverse cursor-pointer rounded-xl gap-3 p-3 border-2 transition-all duration-300",
                    "data-[selected=true]:border-rose-400 data-[selected=true]:bg-rose-500/10",
                ),
                label: "text-white font-medium",
                description: "text-gray-400 text-sm",
            }}
        >
            {children}
        </Radio>
    );
};

type MinimalHudPositionTabsProps = {
    position?: MinimalHudPosition;
    updateSettings: (key: keyof Settings, value: any) => void;
}

export default function MinimalHudPositionTabs({ position, updateSettings }: MinimalHudPositionTabsProps) {
    position = position || DefaultMinimalHudPosition;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-4"
        >
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                className="flex items-center gap-2"
            >
                <IoLocationOutline className="text-rose-400 text-lg" />
                <h3 className="text-white font-semibold text-lg">
                    {i18next.t('settings.minimal_hud.position.title')}
                </h3>
            </motion.div>

            {/* Radio Group */}
            <RadioGroup
                value={position}
                onValueChange={(value) => updateSettings('minimalHudPosition', value as MinimalHudPosition)}
                color='danger'
                classNames={{
                    wrapper: "grid grid-cols-2 gap-y-2"
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <CustomRadio
                        description={i18next.t('settings.minimal_hud.position.top_left_description')}
                        value="top-left"
                    >
                        {i18next.t('settings.minimal_hud.position.top_left')}
                    </CustomRadio>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <CustomRadio
                        description={i18next.t('settings.minimal_hud.position.top_right_description')}
                        value="top-right"
                    >
                        {i18next.t('settings.minimal_hud.position.top_right')}
                    </CustomRadio>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <CustomRadio
                        description={i18next.t('settings.minimal_hud.position.bottom_left_description')}
                        value="bottom-left"
                    >
                        {i18next.t('settings.minimal_hud.position.bottom_left')}
                    </CustomRadio>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <CustomRadio
                        description={i18next.t('settings.minimal_hud.position.bottom_right_description')}
                        value="bottom-right"
                    >
                        {i18next.t('settings.minimal_hud.position.bottom_right')}
                    </CustomRadio>
                </motion.div>
            </RadioGroup>
        </motion.div>
    )
}
