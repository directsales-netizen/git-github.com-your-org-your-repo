'use client';

import { useState } from 'react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { AdminRole, AdminUser } from '@/types/admin';
import { accessibility, buttonVariants, cn, inputVariants, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';
import { SelectField, TextField } from '@/components/admin/FormFields';

const ROLE_OPTIONS: AdminRole[] = ['admin', 'editor', 'viewer'];

const STATUS_TONE: Record<AdminUser['status'], BadgeTone> = {
  active: 'success',
  invited: 'info',
  suspended: 'error',
};

export default function UsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'viewer' as AdminRole });
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function updateRole(user: AdminUser, role: AdminRole) {
    setListError(null);
    const response = await adminFetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (response.ok) {
      const updated: AdminUser = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      router.refresh();
    } else {
      setListError(await extractAdminErrorMessage(response, `Unable to update ${user.name}.`));
    }
  }

  async function inviteUser() {
    setFormError(null);
    const response = await adminFetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      const created: AdminUser = await response.json();
      setUsers((prev) => [...prev, created]);
      setForm({ name: '', email: '', role: 'viewer' });
      setDrawerOpen(false);
      router.refresh();
    } else {
      setFormError(await extractAdminErrorMessage(response, 'Unable to invite user.'));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setListError(null);
    const response = await adminFetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
    if (response.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      router.refresh();
    } else {
      setListError(await extractAdminErrorMessage(response, 'Unable to remove user.'));
    }
    setDeleteTarget(null);
  }

  const columns: Column<AdminUser>[] = [
    { key: 'name', header: 'Name', sortValue: (u) => u.name, render: (u) => <span className="font-medium text-neutral-white">{u.name}</span> },
    { key: 'email', header: 'Email', sortValue: (u) => u.email },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <select
          aria-label={`Change role for ${u.name}`}
          value={u.role}
          onChange={(event) => updateRole(u, event.target.value as AdminRole)}
          className={`${inputVariants.base} w-auto py-1.5 text-caption`}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge tone={STATUS_TONE[u.status]} label={u.status} /> },
  ];

  return (
    <>
      <div className="flex justify-end">
        <button type="button" onClick={() => { setFormError(null); setDrawerOpen(true); }} className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}>
          Invite User
        </button>
      </div>

      {listError && <p className="mb-3 text-body-sm font-body text-error">{listError}</p>}

      <DataTable
        columns={columns}
        rows={users}
        getRowId={(u) => u.id}
        searchable
        searchPlaceholder="Search users…"
        searchKeys={['name', 'email']}
        emptyMessage="No users yet."
        rowActions={(u) => (
          <button type="button" aria-label={`Remove ${u.name}`} onClick={() => setDeleteTarget(u)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Invite User"
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
              Cancel
            </button>
            <button type="button" onClick={inviteUser} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
              Send invite
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField id="u-name" label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <TextField id="u-email" label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
          <SelectField id="u-role" label="Role" value={form.role} onChange={(v) => setForm((f) => ({ ...f, role: v as AdminRole }))} options={ROLE_OPTIONS.map((r) => ({ label: r, value: r }))} />
          {formError && <p className="text-body-sm font-body text-error">{formError}</p>}
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Remove user"
        message={`Remove "${deleteTarget?.name}" from the admin user list?`}
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
