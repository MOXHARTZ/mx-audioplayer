import { Slider as HeroSlider } from '@heroui/react';
import { cn } from '@/lib/utils';

interface SliderProps {
    value: number;
    max: number;
    step?: number;
    onChange?: (value: number) => void;
    onChangeEnd?: (value: number) => void;
    disabled?: boolean;
    className?: string;
    edge?: boolean;
    'aria-label'?: string;
}

const first = (value: number | number[]) => (Array.isArray(value) ? value[0] : value);

const Slider = ({ value, max, step = 1, onChange, onChangeEnd, disabled, className, edge, ...rest }: SliderProps) => (
    <HeroSlider
        size="sm"
        color="primary"
        minValue={0}
        maxValue={max > 0 ? max : 1}
        step={step}
        value={Math.min(value, max > 0 ? max : 1)}
        isDisabled={disabled || max <= 0}
        onChange={(next) => onChange?.(first(next))}
        onChangeEnd={(next) => onChangeEnd?.(first(next))}
        aria-label={rest['aria-label']}
        className={cn('w-full', className)}
        classNames={{
            base: cn('gap-0', edge && 'group/seek'),
            trackWrapper: edge ? 'h-[3px]' : undefined,
            track: cn(
                'border-transparent',
                edge ? 'bg-ink-3/50 h-[3px] rounded-none my-0' : 'bg-ink-3/60 h-1',
            ),
            filler: cn('bg-ember transition-none', edge && 'rounded-none'),
            thumb: cn(
                'bg-white after:hidden transition-[transform,opacity] duration-150 ease-out',
                edge
                    ? cn(
                        'w-2.5 h-2.5 opacity-0 group-hover/seek:opacity-100',
                        'data-[dragging=true]:opacity-100 data-[dragging=true]:scale-125',
                    )
                    : cn(
                        'w-3.5 h-3.5 shadow-[0_0_0_3px_rgba(11,11,13,0.9)]',
                        'data-[dragging=true]:scale-110',
                    ),
            ),
        }}
    />
);

export default Slider;
