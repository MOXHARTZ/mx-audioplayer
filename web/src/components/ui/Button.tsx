import { forwardRef, ReactNode } from 'react';
import { Button as HeroButton, type ButtonProps as HeroButtonProps } from '@heroui/react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'accent' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HeroButtonProps, 'variant' | 'size' | 'color'> {
    variant?: Variant;
    size?: Size;
    iconOnly?: boolean;
    round?: boolean;
    loading?: boolean;
    startContent?: ReactNode;
}

const map: Record<Variant, { color: HeroButtonProps['color']; variant: HeroButtonProps['variant']; className?: string }> = {
    primary: { color: 'primary', variant: 'solid', className: 'bg-primary-glow font-semibold' },
    accent: { color: 'primary', variant: 'solid', className: 'bg-primary-glow font-semibold' },
    outline: { color: 'default', variant: 'bordered', className: 'border-ink-3/60 text-bone-2 hover:text-white hover:border-ink-4' },
    ghost: { color: 'default', variant: 'light', className: 'text-bone-3 hover:text-white' },
    danger: { color: 'danger', variant: 'light', className: 'font-semibold' },
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    iconOnly,
    round,
    loading,
    className,
    disabled,
    ...props
}, ref) => {
    const preset = map[variant];
    return (
        <HeroButton
            ref={ref}
            size={size}
            color={preset.color}
            variant={preset.variant}
            radius={round ? 'full' : 'md'}
            isIconOnly={iconOnly}
            isLoading={loading}
            isDisabled={disabled || loading}
            className={cn(preset.className, className)}
            {...props}
        />
    );
});

Button.displayName = 'Button';
export default Button;
