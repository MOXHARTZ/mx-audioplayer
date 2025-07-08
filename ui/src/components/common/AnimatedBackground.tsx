import { motion } from "framer-motion";
import { IoMusicalNotesOutline } from "react-icons/io5";
import MX from "/mx.svg";

type AnimatedBackgroundProps = {
    children: React.ReactNode;
    className?: string;
    showLogo?: boolean;
    logoSize?: "sm" | "md" | "lg";
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
};

const logoSizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
};


export default function AnimatedBackground({
    children,
    className = "",
    showLogo = false,
    logoSize = "md",
    title,
    subtitle,
    icon
}: AnimatedBackgroundProps) {
    return (
        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-black via-gray-900 to-rose-900/20 relative overflow-hidden ${className}`}>
            <motion.div
                className="absolute inset-0 opacity-20 -z-50"
                animate={{
                    background: [
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 20% 80%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 60% 60%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.3) 0%, transparent 50%)",
                    ]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            <motion.div
                className="absolute top-8 left-8 text-rose-400/30"
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    type: "spring",
                    stiffness: 40,
                    damping: 8
                }}
            >
                <IoMusicalNotesOutline size={24} />
            </motion.div>

            <motion.div
                className="absolute bottom-8 right-8 text-rose-400/30"
                animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                    type: "spring",
                    stiffness: 35,
                    damping: 7
                }}
            >
                <IoMusicalNotesOutline size={20} />
            </motion.div>

            <motion.div
                className="absolute top-1/2 left-1/4 text-rose-400/20"
                animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                    type: "spring",
                    stiffness: 45,
                    damping: 9
                }}
            >
                <IoMusicalNotesOutline size={20} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                }}
                className="flex w-full max-w-xl flex-col gap-6 rounded-2xl bg-black/40 border border-rose-500/20 px-8 pb-8 pt-8 shadow-2xl"
            >
                {(showLogo || title) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 150,
                            damping: 20,
                            delay: 0.2
                        }}
                        className="flex flex-col items-center gap-4"
                    >
                        {showLogo && (
                            <motion.div
                                className={`${logoSizeClasses[logoSize]} rounded-full bg-gradient-to-br from-white-500 to-rose-500 p-2 flex items-center justify-center shadow-lg shadow-rose-500/25`}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 0 25px rgba(244, 63, 94, 0.4)",
                                    transition: { type: "spring", stiffness: 300, damping: 20 }
                                }}
                                whileTap={{
                                    scale: 0.95,
                                    transition: { type: "spring", stiffness: 400, damping: 15 }
                                }}
                            >
                                <img src={MX} alt="MX" className="w-full h-full object-cover rounded-full mt-1" />
                            </motion.div>
                        )}
                        {(title || subtitle) && (
                            <div className="text-center">
                                {title && (
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-400 bg-clip-text text-transparent flex items-center gap-2 justify-center">
                                        {icon}
                                        {title}
                                    </h1>
                                )}
                                {subtitle && (
                                    <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
                {children}
            </motion.div>
        </div>
    );
} 