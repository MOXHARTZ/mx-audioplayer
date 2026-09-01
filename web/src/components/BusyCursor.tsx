import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

const BusyCursor = () => {
    const waiting = useStore(s => s.waiting);
    const nodeRef = useRef<HTMLDivElement>(null);
    const pointer = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            pointer.current.x = e.clientX;
            pointer.current.y = e.clientY;
            const node = nodeRef.current;
            if (node) node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    useEffect(() => {
        const node = nodeRef.current;
        if (!node || !waiting) return;
        node.style.transform = `translate3d(${pointer.current.x}px, ${pointer.current.y}px, 0)`;
    }, [waiting]);

    if (!waiting) return null;

    return (
        <div
            ref={nodeRef}
            aria-hidden
            className="fixed top-0 left-0 z-[300] pointer-events-none will-change-transform"
        >
            <div className="-translate-x-1/2 -translate-y-1/2 busy-cursor-pop">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="busy-cursor-spin drop-shadow-[0_1px_3px_rgba(2,6,23,0.9)]"
                >
                    <circle cx="12" cy="12" r="9" stroke="#020617" strokeWidth="5" opacity="0.75" />
                    <circle cx="12" cy="12" r="9" stroke="#94a3b8" strokeWidth="2.5" opacity="0.35" />
                    <path d="M12 3a9 9 0 0 1 9 9" stroke="#e8172c" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>
        </div>
    );
};

export default BusyCursor;
