'use client';

import { useState } from 'react';
import { useOtpGateOpen, resolveOtp } from '@/lib/admin/otpGateStore';
import { buttonVariants, cn, spacing } from '@/design';
import Modal from './Modal';
import { TextField } from './FormFields';

/**
 * Mounted once in AdminShell — adminFetch() (src/lib/admin/adminFetch.ts)
 * opens this from anywhere a mutation needs a PIN, and awaits the result.
 */
export default function OtpGateModal() {
  const isOpen = useOtpGateOpen();
  const [code, setCode] = useState('');

  function handleClose() {
    setCode('');
    resolveOtp(null);
  }

  function handleSubmit() {
    resolveOtp(code);
    setCode('');
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enter your PIN"
      size="sm"
      footer={
        <>
          <button type="button" onClick={handleClose} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={code.length === 0} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
            Confirm
          </button>
        </>
      }
    >
      <p className="text-body-sm font-body text-neutral-light-gray">
        We texted a PIN to the SuperAdmin phone on file. Enter it to confirm this change.
      </p>
      <div className="mt-4">
        <TextField id="admin-otp-code" label="PIN" value={code} onChange={setCode} />
      </div>
    </Modal>
  );
}
