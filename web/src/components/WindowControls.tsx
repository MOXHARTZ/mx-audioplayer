import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection,
} from '@heroui/react';
import { IoSettingsOutline, IoPersonOutline, IoLogOutOutline, IoCloseOutline } from 'react-icons/io5';
import { useStore } from '@/store';
import { fetchNui } from '@/lib/nui';
import SettingsDialog from '@/modals/SettingsDialog';
import ProfileDialog from '@/modals/ProfileDialog';

const WindowControls = ({ onClose }: { onClose: () => void }) => {
    const { t } = useTranslation();
    const user = useStore(s => s.user);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const fullName = [user?.firstname, user?.lastname].filter(Boolean).join(' ');

    return (
        <>
            <div className="absolute top-4 right-5 z-30 flex items-center gap-2 pointer-events-none">
                <button
                    onClick={() => setSettingsOpen(true)}
                    className="icon-btn pointer-events-auto"
                    aria-label={t('settings.title')}
                >
                    <IoSettingsOutline size={18} />
                </button>

                <Dropdown
                    placement="bottom-end"
                    classNames={{
                        content: 'bg-ink-1 border border-ink-3/60 rounded-xl shadow-lift min-w-[13rem]',
                    }}
                >
                    <DropdownTrigger>
                        <button
                            className="pointer-events-auto rounded-full transition-transform duration-150 ease-out active:scale-95"
                            aria-label={user?.username}
                        >
                            <Avatar
                                size="sm"
                                src={user?.avatar}
                                name={(user?.firstname ?? user?.username ?? '?').charAt(0).toUpperCase()}
                                classNames={{
                                    base: 'bg-ink-2 border border-ink-3/60 w-9 h-9',
                                    name: 'text-xs font-bold text-bone-2',
                                }}
                            />
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label={t('header.edit_profile')} variant="flat">
                        <DropdownSection showDivider classNames={{ divider: 'bg-ink-3/50' }}>
                            <DropdownItem
                                key="identity"
                                isReadOnly
                                className="opacity-100 cursor-default data-[hover=true]:bg-transparent"
                                textValue={user?.username ?? ''}
                            >
                                <p className="text-sm font-semibold text-white truncate">{fullName}</p>
                                <p className="text-xs text-bone-4 truncate">@{user?.username}</p>
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection>
                            {user?.isOwner ? (
                                <DropdownItem
                                    key="profile"
                                    startContent={<IoPersonOutline />}
                                    className="text-bone-2 data-[hover=true]:text-white"
                                    onPress={() => setProfileOpen(true)}
                                >
                                    {t('header.edit_profile')}
                                </DropdownItem>
                            ) : null}
                            <DropdownItem
                                key="logout"
                                color="danger"
                                className="text-danger"
                                startContent={<IoLogOutOutline />}
                                onPress={() => fetchNui('logout')}
                            >
                                {t('header.logout')}
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>

                <button onClick={onClose} className="icon-btn pointer-events-auto" aria-label="close">
                    <IoCloseOutline size={20} />
                </button>
            </div>

            <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
};

export default memo(WindowControls);
