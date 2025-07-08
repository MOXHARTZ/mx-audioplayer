import { Button, ButtonProps } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type GradientButtonProps = Omit<ButtonProps, 'variant'> & {
    children: ReactNode;
    variant?: "primary" | "secondary";
    isLoading?: boolean;
    loadingText?: string;
};

export default function GradientButton({
    children,
    variant = "primary",
    isLoading = false,
    loadingText,
    className = "",
    ...props
}: GradientButtonProps) {
    const baseClasses = "font-semibold shadow-lg transition-all duration-300";

    const variantClasses = {
        primary: "bg-gradient-to-r from-rose-500 via-red-500 to-red-600 text-white shadow-rose-500/25 hover:shadow-rose-500/40",
        secondary: "bg-black/20 border-rose-500/30 text-white hover:border-rose-400/50 hover:bg-black/30"
    };

    const loadingSpinner = (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
            }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
        />
    );

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full"
        >
            <Button
                fullWidth
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                isLoading={isLoading}
                spinner={loadingSpinner}
                {...props}
            >
                {isLoading && loadingText ? loadingText : children}
            </Button>
        </motion.div>
    );
} 