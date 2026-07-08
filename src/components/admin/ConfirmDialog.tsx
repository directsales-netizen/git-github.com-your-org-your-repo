'use client';

import { accessibility, buttonVariants, cn, spacing } from '@/design';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className={cn(buttonVariants.ghost, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              danger ? buttonVariants.danger : buttonVariants.primary,
              spacing.buttonPadding,
              accessibility.focusRing,
              'text-body-sm'
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-sm font-body text-neutral-light-gray">{message}</p>
    </Modal>
  );
}
