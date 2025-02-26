import { Card, CardBody, RadioGroup, Radio, cn } from "@heroui/react";
import { MinimalHudPosition, Settings } from '@/utils/types';
import { DefaultMinimalHudPosition } from "@/utils/defaults";
import i18next from "i18next";

export const CustomRadio = (props: React.ComponentProps<typeof Radio>) => {
    const { children, ...otherProps } = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex flex-row-reverse cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-danger",
                ),
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
        <Card>
            <CardBody>
                <RadioGroup
                    value={position}
                    onValueChange={(value) => updateSettings('minimalHudPosition', value as MinimalHudPosition)}
                    color='danger'
                    label={i18next.t('settings.minimal_hud.position.title')}
                    classNames={{
                        wrapper: "grid grid-cols-2 overflow-hidden"
                    }}
                >
                    <CustomRadio description={i18next.t('settings.minimal_hud.position.top_left_description')} value="top-left">
                        {i18next.t('settings.minimal_hud.position.top_left')}
                    </CustomRadio>
                    <CustomRadio description={i18next.t('settings.minimal_hud.position.top_right_description')} value="top-right">
                        {i18next.t('settings.minimal_hud.position.top_right')}
                    </CustomRadio>
                    <CustomRadio description={i18next.t('settings.minimal_hud.position.bottom_left_description')} value="bottom-left">
                        {i18next.t('settings.minimal_hud.position.bottom_left')}
                    </CustomRadio>
                    <CustomRadio description={i18next.t('settings.minimal_hud.position.bottom_right_description')} value="bottom-right">
                        {i18next.t('settings.minimal_hud.position.bottom_right')}
                    </CustomRadio>
                </RadioGroup>
            </CardBody>
        </Card>

    )
}
