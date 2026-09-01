import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollingTextProps {
    children: string;
    className?: string;
    speed?: number;
    pause?: number;
}

const ScrollingText = ({ children, className, speed = 26, pause = 1.4 }: ScrollingTextProps) => {
    const viewportRef = useRef<HTMLSpanElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [overflow, setOverflow] = useState(0);

    useLayoutEffect(() => {
        const measure = () => {
            const viewport = viewportRef.current;
            const text = textRef.current;
            if (!viewport || !text) return;
            setOverflow(Math.max(0, Math.ceil(text.scrollWidth - viewport.clientWidth)));
        };
        measure();

        const observer = new ResizeObserver(measure);
        if (viewportRef.current) observer.observe(viewportRef.current);
        return () => observer.disconnect();
    }, [children]);

    useEffect(() => {
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
        if (!fonts) return;
        let cancelled = false;
        fonts.ready.then(() => {
            if (cancelled) return;
            const viewport = viewportRef.current;
            const text = textRef.current;
            if (!viewport || !text) return;
            setOverflow(Math.max(0, Math.ceil(text.scrollWidth - viewport.clientWidth)));
        });
        return () => { cancelled = true; };
    }, [children]);

    const travel = overflow > 2 ? overflow : 0;
    const duration = travel > 0 ? travel / speed : 0;

    return (
        <span ref={viewportRef} className={cn('block overflow-hidden whitespace-nowrap', className)}>
            <span
                ref={textRef}
                className={cn('inline-block will-change-transform', travel > 0 && 'marquee-swing')}
                style={travel > 0 ? {
                    '--marquee-travel': `-${travel}px`,
                    '--marquee-duration': `${(duration + pause) * 2}s`,
                } as React.CSSProperties : undefined}
            >
                {children}
            </span>
        </span>
    );
};

export default ScrollingText;
