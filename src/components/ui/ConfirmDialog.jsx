import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you absolutely sure?',
  message = 'This action cannot be undone. Please confirm you want to proceed.',
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger'
}) {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-sm"
    >
      <div className="flex gap-4 items-start py-2">
        <div className={`p-2.5 rounded-xl shrink-0 ${
          variant === 'danger' ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500'
        }`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{message}</p>
      </div>
    </Modal>
  );
}
