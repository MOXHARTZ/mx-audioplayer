import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { IoSearchOutline, IoAddOutline, IoCloseOutline } from "react-icons/io5";
import { Account } from "@/utils/types";
import AccountCard from "./AccountCard";
import { StyledInput } from "@/components/common";
import i18next from "i18next";

type AccountSelectorProps = {
    accounts: Account[];
    onAccountSelect: (account: Account) => void;
    onManualLogin: () => void;
}

export default function AccountSelector({
    accounts,
    onAccountSelect,
    onManualLogin,
}: AccountSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account =>
            account.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.lastname.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [accounts, searchQuery]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: 0.2
            }}
            className="space-y-6 overflow-hidden h-[60vh] flex flex-col"
        >
            <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">
                    {i18next.t('login.select_account')}
                </h2>
                <p className="text-gray-400 text-sm">
                    {i18next.t('login.select_account_subtitle')}
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <StyledInput
                    placeholder={i18next.t('login.search_accounts')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startIcon={<IoSearchOutline className="text-rose-400 text-xl" />}
                    endIcon={
                        searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <IoCloseOutline className="text-xl" />
                            </button>
                        )
                    }
                />
            </motion.div>

            <div className="space-y-4 overflow-y-auto flex-1 flex-grow">
                <AnimatePresence mode="wait">
                    {filteredAccounts.length > 0 ? (
                        <motion.div
                            key="accounts-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            {filteredAccounts.map((account) => (
                                <AccountCard
                                    key={account.username}
                                    account={account}
                                    onSelect={onAccountSelect}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="no-accounts"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-12"
                        >
                            <div className="text-gray-400 text-lg mb-2">
                                {i18next.t('login.no_accounts_found')}
                            </div>
                            <p className="text-gray-500 text-sm">
                                {i18next.t('login.try_different_search')}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-rose-500/20"
            >
                <button
                    onClick={onManualLogin}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-rose-500/30 hover:border-rose-400/50 hover:bg-rose-500/10 transition-all duration-300 group"
                >
                    <IoAddOutline className="text-gray-400 group-hover:text-rose-400 transition-colors text-xl" />
                    <span className="text-gray-400 group-hover:text-rose-400 transition-colors font-medium">
                        {i18next.t('login.manual_login')}
                    </span>
                </button>
            </motion.div>
        </motion.div>
    );
}
