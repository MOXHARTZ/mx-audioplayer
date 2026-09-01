import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { cn } from '@/lib/utils';

export interface MenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    danger?: boolean;
    children?: MenuItem[];
    onSelect?: () => void;
}

interface ContextMenuProps {
    items: MenuItem[];
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}

const MENU_WIDTH = 216;
const ROW_HEIGHT = 40;

const ContextMenu = ({ items, disabled, children, className }: ContextMenuProps) => {
    const reduce = useReducedMotion();
    const [open, setOpen] = useState(false);
    const [submenu, setSubmenu] = useState<string | null>(null);
    const [position, setPosition] = useState({ x: 0, y: 0, originX: 'left', originY: 'top' });
    const menuRef = useRef<HTMLDivElement>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        const estHeight = items.length * ROW_HEIGHT + 16;
        const flipX = e.clientX + MENU_WIDTH > window.innerWidth;
        const flipY = e.clientY + estHeight > window.innerHeight;
        setPosition({
            x: Math.max(10, flipX ? window.innerWidth - MENU_WIDTH - 10 : e.clientX),
            y: Math.max(10, flipY ? e.clientY - estHeight : e.clientY),
            originX: flipX ? 'right' : 'left',
            originY: flipY ? 'bottom' : 'top',
        });
        setSubmenu(null);
        setOpen(true);
    }, [disabled, items.length]);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        };
        const closeOnEscape = (e: KeyboardEvent) => {
            if (e.code !== 'Escape') return;
            e.stopPropagation();
            setOpen(false);
        };
        document.addEventListener('mousedown', close);
        window.addEventListener('keydown', closeOnEscape, true);
        return () => {
            document.removeEventListener('mousedown', close);
            window.removeEventListener('keydown', closeOnEscape, true);
        };
    }, [open]);

    const rowClass = (danger?: boolean) => cn(
        'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left',
        'transition-colors duration-100',
        danger ? 'text-danger hover:bg-danger/10' : 'text-bone-2 hover:bg-ink-3/50 hover:text-white',
    );

    return (
        <>
            <div className={cn('w-full', className)} onContextMenu={handleContextMenu}>
                {children}
            </div>
            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            ref={menuRef}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                left: position.x,
                                top: position.y,
                                width: MENU_WIDTH,
                                transformOrigin: `${position.originY} ${position.originX}`,
                            }}
                            className="fixed z-[150] rounded-xl bg-ink-1 border border-ink-3/60 shadow-lift py-1.5"
                        >
                            {items.map((item, index) => {
                                if (item.children?.length) {
                                    const isOpen = submenu === item.key;
                                    const flip = position.x + MENU_WIDTH * 2 > window.innerWidth;
                                    return (
                                        <div
                                            key={item.key}
                                            className="relative"
                                            onMouseEnter={() => setSubmenu(item.key)}
                                            onMouseLeave={() => setSubmenu(current => (current === item.key ? null : current))}
                                        >
                                            <button className={cn(rowClass(item.danger), isOpen && 'bg-ink-3/50 text-white')}>
                                                {item.icon && <span className="shrink-0 text-base">{item.icon}</span>}
                                                <span className="truncate flex-1">{item.label}</span>
                                                <IoChevronForwardOutline size={14} className="shrink-0 text-ink-4" />
                                            </button>
                                            {isOpen && (
                                                <div
                                                    style={{
                                                        width: MENU_WIDTH,
                                                        top: Math.min(0, window.innerHeight - position.y - (index * ROW_HEIGHT) - item.children.length * ROW_HEIGHT - 24),
                                                    }}
                                                    className={cn(
                                                        'absolute rounded-xl bg-ink-1 border border-ink-3/60 shadow-lift py-1.5',
                                                        'max-h-64 overflow-y-auto scroll-thin',
                                                        flip ? 'right-full mr-1' : 'left-full ml-1',
                                                    )}
                                                >
                                                    {item.children.map(child => (
                                                        <button
                                                            key={child.key}
                                                            onClick={() => {
                                                                setOpen(false);
                                                                child.onSelect?.();
                                                            }}
                                                            className={rowClass(child.danger)}
                                                        >
                                                            {child.icon && <span className="shrink-0 text-base">{child.icon}</span>}
                                                            <span className="truncate">{child.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={item.key}
                                        onMouseEnter={() => setSubmenu(null)}
                                        onClick={() => {
                                            setOpen(false);
                                            item.onSelect?.();
                                        }}
                                        className={cn(rowClass(item.danger), 'active:scale-[0.99]')}
                                    >
                                        {item.icon && <span className="shrink-0 text-base">{item.icon}</span>}
                                        <span className="truncate">{item.label}</span>
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body,
            )}
        </>
    );
};

export default ContextMenu;
