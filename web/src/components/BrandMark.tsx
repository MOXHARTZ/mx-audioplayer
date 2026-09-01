import { cn } from '@/lib/utils';

const BrandMark = ({ size = 32, className }: { size?: number; className?: string }) => (
    <span
        className={cn('rounded-lg bg-primary-glow flex items-center justify-center shrink-0', className)}
        style={{ width: size, height: size }}
        aria-hidden
    >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
            <path d="M9 18V6l10-2v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
            <circle cx="16.5" cy="16" r="2.5" fill="currentColor" />
        </svg>
    </span>
);

export default BrandMark;
