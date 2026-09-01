import { forwardRef, ReactNode } from 'react';
import {
    Input as HeroInput,
    Textarea as HeroTextarea,
    type InputProps as HeroInputProps,
    type TextAreaProps as HeroTextareaProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

const fieldClassNames = {
    label: 'text-[11px] uppercase tracking-[0.14em] text-bone-3 font-semibold',
    inputWrapper: cn(
        'bg-ink-1/70 border border-ink-3/50 data-[hover=true]:bg-ink-1/70',
        'data-[hover=true]:border-ink-4/70 group-data-[focus=true]:border-ember/70',
        'group-data-[focus=true]:shadow-[0_0_0_3px_rgba(232,23,44,0.14)]',
        'transition-colors duration-200 ease-out',
    ),
    input: 'text-sm text-white placeholder:text-ink-4',
};

export interface InputProps extends Omit<HeroInputProps, 'startContent' | 'endContent'> {
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    startIcon,
    endIcon,
    wrapperClassName,
    label,
    ...props
}, ref) => (
    <HeroInput
        ref={ref}
        label={label}
        labelPlacement={label ? 'outside' : undefined}
        variant="bordered"
        radius="md"
        startContent={startIcon ? <span className="text-ink-4 shrink-0">{startIcon}</span> : undefined}
        endContent={endIcon ? <span className="text-ink-4 shrink-0">{endIcon}</span> : undefined}
        classNames={{
            ...fieldClassNames,
            base: cn(label ? 'gap-1.5' : '', wrapperClassName),
        }}
        {...props}
    />
));

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, HeroTextareaProps>(({ label, ...props }, ref) => (
    <HeroTextarea
        ref={ref}
        label={label}
        labelPlacement={label ? 'outside' : undefined}
        variant="bordered"
        radius="md"
        classNames={fieldClassNames}
        {...props}
    />
));

Textarea.displayName = 'Textarea';
