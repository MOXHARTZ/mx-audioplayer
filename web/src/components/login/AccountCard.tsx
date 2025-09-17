import { motion } from "framer-motion";
import { IoPersonOutline, IoLockClosedOutline } from "react-icons/io5";
import { Account } from "@/utils/types";
import { Button } from "@heroui/react";
import classNames from "classnames";

type AccountCardProps = {
    account: Account;
    onSelect: (account: Account) => void;
}

export default function AccountCard({ account, onSelect }: AccountCardProps) {

    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    };

    return (
        <Button
            onPress={() => onSelect(account)}
            size='lg'
            className='w-full h-full border-rose-500/20 bg-black/20 hover:border-rose-400/50 hover:bg-black/30'
        >
            <motion.div
                className="absolute inset-0 opacity-0"
                transition={{ duration: 0.3 }}
                style={{
                    background: `linear-gradient(135deg, from-rose-600 to-red-600)`
                }}
            />

            <div className="relative p-6">
                <motion.div
                    className='w-16 h-16 rounded-full bg-gradient-to-br from-rose-600 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/25 mx-auto mb-4'
                    transition={{ duration: 0.3 }}
                >
                    {account.avatar ? (
                        <img
                            src={account.avatar}
                            alt={account.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        getInitials(account.firstname, account.lastname)
                    )}
                </motion.div>

                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-white">
                        {account.firstname} {account.lastname}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <IoPersonOutline className="text-sm" />
                        <span className="text-sm">{account.username}</span>
                    </div>
                </div>

                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent opacity-0"
                    transition={{ duration: 0.3 }}
                />
            </div>
        </Button>
    );
}
