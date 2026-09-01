import { useTranslation } from 'react-i18next';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
}

const ConfirmDialog = ({ open, onClose, onConfirm, title, description }: ConfirmDialogProps) => {
    const { t } = useTranslation();
    return (
        <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
            <div className="flex gap-3">
                <Button variant="outline" fullWidth onPress={onClose}>
                    {t('modal.cancel')}
                </Button>
                <Button variant="primary" fullWidth onPress={onConfirm}>
                    {t('modal.confirm')}
                </Button>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
