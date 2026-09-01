import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const Kbd = ({ children, className }: { children: ReactNode; className?: string }) => (
    <kbd
        className={cn(
            'inline-flex items-center gap-0.5 rounded-md border border-ink-3/50 bg-ink-2/70',
            'px-1.5 py-0.5 text-[10px] font-semibold text-bone-2 leading-none',
            className,
        )}
    >
        {children}
    </kbd>
);

export default Kbd;
