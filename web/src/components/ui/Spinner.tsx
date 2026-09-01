import { cn } from '@/lib/utils';

const Spinner = ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
        className={cn('animate-spin text-current', className)}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="loading"
    >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
            className="opacity-90"
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
        />
    </svg>
);

export default Spinner;
