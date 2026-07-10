'use client';

import { createContext, useContext, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { accessibility, cn } from '@/design';
import OtpGateModal from '@/components/admin/OtpGateModal';

interface EditModeContextValue {
  canEdit: boolean;
  editModeOn: boolean;
}

const EditModeContext = createContext<EditModeContextValue>({ canEdit: false, editModeOn: false });

/** Used by InlineEditableText to decide whether to render edit affordances. */
export function useEditMode(): EditModeContextValue {
  return useContext(EditModeContext);
}

/**
 * Wraps the storefront so editor+ admins can toggle inline editing on the
 * live site. Mounts OtpGateModal here too (normally only mounted in
 * AdminShell) — without this, a PIN-gated save triggered from the public
 * site would hang forever awaiting a modal that was never rendered.
 */
export default function EditModeProvider({ canEdit, children }: { canEdit: boolean; children: React.ReactNode }) {
  const [editModeOn, setEditModeOn] = useState(false);

  return (
    <EditModeContext.Provider value={{ canEdit, editModeOn: canEdit && editModeOn }}>
      {children}

      {canEdit && (
        <button
          type="button"
          onClick={() => setEditModeOn((v) => !v)}
          className={cn(
            // top-right, not bottom — the bottom of the viewport is already
            // claimed by the full-width cookie-consent banner (VisitorTracker.tsx)
            // and the chat widget launcher, both anchored to the bottom.
            'fixed right-6 top-20 z-modal flex items-center gap-2 rounded-full bg-accent-primary px-4 py-2.5 text-body-sm font-body font-semibold text-bg-primary shadow-elevation transition-colors hover:bg-accent-light',
            accessibility.focusRing
          )}
        >
          {editModeOn ? <X size={16} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
          {editModeOn ? 'Done Editing' : 'Edit Page'}
        </button>
      )}

      {canEdit && <OtpGateModal />}
    </EditModeContext.Provider>
  );
}
