import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import BrandMark from '@/components/BrandMark';

interface AuthLayoutProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
}

const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
    const reduce = useReducedMotion();
    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                className="bezel w-full max-w-[420px] p-8"
            >
                <div className="flex flex-col items-center text-center mb-7">
                    <BrandMark size={44} className="mb-4" />
                    <h1 className="title text-[22px]">{title}</h1>
                    {subtitle && <p className="text-sm text-bone-3 mt-2">{subtitle}</p>}
                </div>
                {children}
            </motion.div>
        </div>
    );
};

export default AuthLayout;
