import { motion } from "framer-motion";

export default function SearchSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                duration: 0.3,
                ease: "easeOut"
            }}
            className="w-full p-4 rounded-xl bg-black/20 border border-rose-500/20"
        >
            <div className="flex gap-4">
                <motion.div
                    className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30"
                    animate={{
                        background: [
                            "linear-gradient(45deg, rgba(244, 63, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)",
                            "linear-gradient(45deg, rgba(244, 63, 94, 0.3) 0%, rgba(239, 68, 68, 0.3) 100%)",
                            "linear-gradient(45deg, rgba(244, 63, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)",
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <div className="flex flex-col gap-3 flex-1">
                    <motion.div
                        className="h-4 bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-lg"
                        animate={{
                            background: [
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(244, 63, 94, 0.2) 100%)",
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.3) 0%, rgba(239, 68, 68, 0.3) 50%, rgba(244, 63, 94, 0.3) 100%)",
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(244, 63, 94, 0.2) 100%)",
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ width: "70%" }}
                    />

                    <motion.div
                        className="h-3 bg-gradient-to-r from-rose-500/15 to-red-500/15 rounded-lg"
                        animate={{
                            background: [
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(239, 68, 68, 0.15) 50%, rgba(244, 63, 94, 0.15) 100%)",
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.25) 0%, rgba(239, 68, 68, 0.25) 50%, rgba(244, 63, 94, 0.25) 100%)",
                                "linear-gradient(90deg, rgba(244, 63, 94, 0.15) 0%, rgba(239, 68, 68, 0.15) 50%, rgba(244, 63, 94, 0.15) 100%)",
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.3
                        }}
                        style={{ width: "50%" }}
                    />
                </div>
            </div>
        </motion.div>
    )
}