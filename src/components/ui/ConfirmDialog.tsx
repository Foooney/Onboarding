import { Modal } from './Modal';
import { buttonClasses } from '../../lib/utils';

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onCancel} className={buttonClasses('secondary')}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={buttonClasses(tone === 'danger' ? 'danger' : 'primary')}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body text-ink-600">{description}</p>
    </Modal>
  );
}
