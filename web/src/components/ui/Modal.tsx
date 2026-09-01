import { ReactNode, useEffect } from 'react';
import {
    Modal as HeroModal,
    ModalContent,
    ModalHeader,
    ModalBody,
    type ModalProps as HeroModalProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const sizeMap: Record<NonNullable<ModalProps['size']>, HeroModalProps['size']> = {
    sm: 'sm',
    md: 'md',
    lg: 'xl',
    xl: '2xl',
};

const Modal = ({ open, onClose, title, description, children, size = 'md', className }: ModalProps) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.code === 'Escape') e.stopPropagation();
        };
        window.addEventListener('keydown', handler, true);
        return () => window.removeEventListener('keydown', handler, true);
    }, [open]);

    return (
        <HeroModal
            isOpen={open}
            onClose={onClose}
            size={sizeMap[size]}
            radius="lg"
            scrollBehavior="inside"
            backdrop="opaque"
            classNames={{
                backdrop: 'bg-black/70',
                base: cn('bezel border-ink-3/50 text-white', className),
                header: 'border-b border-ink-3/40 px-6 pt-5 pb-4 flex-col items-start gap-0.5',
                body: 'px-6 py-5',
                closeButton: 'text-bone-3 hover:text-white active:scale-95 transition-transform duration-150',
            }}
        >
            <ModalContent>
                {(title || description) && (
                    <ModalHeader>
                        {title && <span className="text-base font-bold text-white">{title}</span>}
                        {description && <span className="text-xs text-bone-3 font-normal">{description}</span>}
                    </ModalHeader>
                )}
                <ModalBody>{children}</ModalBody>
            </ModalContent>
        </HeroModal>
    );
};

export default Modal;
