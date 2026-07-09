'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import type { SiteContentSettings } from '@/types/admin';
import type { Testimonial } from '@/types/testimonial';
import { accessibility, buttonVariants, cardVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { TextField, TextareaField, ToggleField } from '@/components/admin/FormFields';

interface TestimonialForm {
  name: string;
  location: string;
  quote: string;
  rating: string;
  device: string;
}

const EMPTY_TESTIMONIAL: TestimonialForm = { name: '', location: '', quote: '', rating: '5', device: '' };

export default function ContentClient({ initialContent, initialTestimonials }: { initialContent: SiteContentSettings; initialTestimonials: Testimonial[] }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [isSavingContent, setIsSavingContent] = useState(false);

  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialForm>(EMPTY_TESTIMONIAL);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  async function saveContent() {
    setIsSavingContent(true);
    const response = await adminFetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    if (response.ok) {
      setContent(await response.json());
      router.refresh();
    }
    setIsSavingContent(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_TESTIMONIAL);
    setDrawerOpen(true);
  }

  function openEdit(testimonial: Testimonial) {
    setEditingId(testimonial.id);
    setForm({
      name: testimonial.name,
      location: testimonial.location,
      quote: testimonial.quote,
      rating: String(testimonial.rating),
      device: testimonial.device,
    });
    setDrawerOpen(true);
  }

  async function saveTestimonial() {
    const payload = { ...form, rating: Number(form.rating) };
    const response = await adminFetch(editingId ? `/api/admin/content/testimonials/${editingId}` : '/api/admin/content/testimonials', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const saved: Testimonial = await response.json();
      setTestimonials((prev) => (editingId ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev]));
      setDrawerOpen(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const response = await adminFetch(`/api/admin/content/testimonials/${deleteTarget.id}`, { method: 'DELETE' });
    if (response.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      router.refresh();
    }
    setDeleteTarget(null);
  }

  const columns: Column<Testimonial>[] = [
    { key: 'name', header: 'Name', sortValue: (t) => t.name, render: (t) => <span className="font-medium text-neutral-white">{t.name}</span> },
    { key: 'device', header: 'Device', sortValue: (t) => t.device },
    { key: 'rating', header: 'Rating', sortValue: (t) => t.rating, render: (t) => `${t.rating}/5` },
    { key: 'quote', header: 'Quote', render: (t) => <span className="line-clamp-1 text-neutral-silver">{t.quote}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Homepage hero</h2>
        <div className="mt-4 flex flex-col gap-4">
          <TextField id="heroHeadline" label="Headline" value={content.heroHeadline} onChange={(v) => setContent((c) => ({ ...c, heroHeadline: v }))} />
          <TextareaField id="heroSubheadline" label="Subheadline" value={content.heroSubheadline} onChange={(v) => setContent((c) => ({ ...c, heroSubheadline: v }))} />
          <TextField id="heroCtaLabel" label="Primary button label" value={content.heroCtaLabel} onChange={(v) => setContent((c) => ({ ...c, heroCtaLabel: v }))} />
          <ToggleField id="promoBannerEnabled" label="Promo banner" description="Show a banner above the hero" checked={content.promoBannerEnabled} onChange={(v) => setContent((c) => ({ ...c, promoBannerEnabled: v }))} />
          {content.promoBannerEnabled && (
            <TextField id="promoBannerText" label="Promo banner text" value={content.promoBannerText} onChange={(v) => setContent((c) => ({ ...c, promoBannerText: v }))} />
          )}
        </div>
        <button type="button" onClick={saveContent} disabled={isSavingContent} className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-4 text-body-sm')}>
          {isSavingContent ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Testimonials</h2>
          <button type="button" onClick={openCreate} className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}>
            Add Testimonial
          </button>
        </div>
        <div className="mt-3">
          <DataTable
            columns={columns}
            rows={testimonials}
            getRowId={(t) => t.id}
            emptyMessage="No testimonials yet."
            rowActions={(t) => (
              <div className="flex items-center justify-end gap-1">
                <button type="button" aria-label={`Edit testimonial from ${t.name}`} onClick={() => openEdit(t)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}>
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button type="button" aria-label={`Delete testimonial from ${t.name}`} onClick={() => setDeleteTarget(t)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}>
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
              Cancel
            </button>
            <button type="button" onClick={saveTestimonial} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
              Save
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField id="t-name" label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <TextField id="t-location" label="Location" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
          <TextField id="t-device" label="Device" value={form.device} onChange={(v) => setForm((f) => ({ ...f, device: v }))} />
          <TextField id="t-rating" label="Rating (1-5)" type="number" value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
          <TextareaField id="t-quote" label="Quote" value={form.quote} onChange={(v) => setForm((f) => ({ ...f, quote: v }))} rows={4} />
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete testimonial"
        message={`Delete the testimonial from "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
