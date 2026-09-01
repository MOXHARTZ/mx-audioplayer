import { Switch as HeroSwitch } from '@heroui/react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    'aria-label'?: string;
}

const Switch = ({ checked, onChange, disabled, ...rest }: SwitchProps) => (
    <HeroSwitch
        isSelected={checked}
        onValueChange={onChange}
        isDisabled={disabled}
        color="primary"
        size="sm"
        aria-label={rest['aria-label']}
    />
);

export default Switch;
