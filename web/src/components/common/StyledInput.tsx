import { Input, InputProps } from "@heroui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

type StyledInputProps = InputProps & {
    startIcon?: ReactNode;
    endIcon?: ReactNode;
};

export default function StyledInput({
    startIcon,
    endIcon,
    className = "",
    classNames = {},
    ...props
}: StyledInputProps) {
    const defaultClassNames = {
        input: "bg-black/20 border-rose-500/30 text-white placeholder:text-gray-500",
        label: "text-gray-300",
        inputWrapper: "bg-black/20 border-rose-500/30 hover:border-rose-400/50 focus-within:border-rose-400"
    };

    const mergedClassNames = {
        ...defaultClassNames,
        ...classNames
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Input
                variant="bordered"
                classNames={mergedClassNames}
                startContent={startIcon}
                endContent={endIcon}
                className={className}
                {...props}
            />
        </motion.div>
    );
} 