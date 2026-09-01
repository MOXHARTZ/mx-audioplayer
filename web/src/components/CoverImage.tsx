import { ImgHTMLAttributes, useState } from 'react';
import { IoMusicalNotesOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

interface CoverImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    fallbackClassName?: string;
}

const CoverImage = ({ src, className, fallbackClassName, alt = '', ...props }: CoverImageProps) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <span className={cn(
                'flex items-center justify-center bg-ink-1 text-ink-4 shrink-0',
                className,
                fallbackClassName,
            )}>
                <IoMusicalNotesOutline className="w-1/2 h-1/2" />
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            draggable={false}
            onError={() => setFailed(true)}
            {...props}
        />
    );
};

export default CoverImage;
