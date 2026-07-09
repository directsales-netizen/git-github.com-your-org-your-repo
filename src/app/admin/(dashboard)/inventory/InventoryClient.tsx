'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import { Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_GRADE_LABELS, type Product, type ProductCategory, type ProductGrade } from '@/types/product';
import { accessibility, buttonVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import { SelectField, TextField } from '@/components/admin/FormFields';

interface FormState {
  title: string;
  category: ProductCategory;
  grade: ProductGrade;
  price: string;
  originalPrice: string;
  stock: string;
  lowStockThreshold: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  category: 'MacBooks',
  grade: 'A',
  price: '',
  originalPrice: '',
  stock: '',
  lowStockThreshold: '5',
};

export default function InventoryClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      category: product.category,
      grade: product.grade,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold),
    });
    setError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      category: form.category,
      grade: form.grade,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
    };

    try {
      const response = await adminFetch(editingId ? `/api/admin/inventory/${editingId}` : '/api/admin/inventory', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Unable to save product.');
        return;
      }
      const saved: Product = await response.json();
      setProducts((prev) => (editingId ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]));
      setDrawerOpen(false);
      router.refresh();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setIsSaving(false);
    }
  }

  async function adjustStock(product: Product, delta: number) {
    const nextStock = Math.max(0, product.stock + delta);
    const response = await adminFetch(`/api/admin/inventory/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: nextStock }),
    });
    if (response.ok) {
      const saved: Product = await response.json();
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const response = await adminFetch(`/api/admin/inventory/${deleteTarget.id}`, { method: 'DELETE' });
    if (response.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      router.refresh();
    }
    setDeleteTarget(null);
  }

  const columns: Column<Product>[] = [
    { key: 'title', header: 'Product', sortValue: (p) => p.title, render: (p) => <span className="font-medium text-neutral-white">{p.title}</span> },
    { key: 'category', header: 'Category', sortValue: (p) => p.category },
    { key: 'grade', header: 'Grade', sortValue: (p) => p.grade, render: (p) => PRODUCT_GRADE_LABELS[p.grade] },
    { key: 'price', header: 'Price', sortValue: (p) => p.price, render: (p) => `$${p.price.toLocaleString()}` },
    {
      key: 'stock',
      header: 'Stock',
      sortValue: (p) => p.stock,
      render: (p) => (
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Decrease stock for ${p.title}`} onClick={() => adjustStock(p, -1)} disabled={p.stock === 0} className={cn('flex h-6 w-6 items-center justify-center rounded border border-neutral-titanium/40 hover:border-accent-primary disabled:opacity-30', accessibility.focusRing)}>
            <Minus size={12} aria-hidden="true" />
          </button>
          <span className="w-6 text-center">{p.stock}</span>
          <button type="button" aria-label={`Increase stock for ${p.title}`} onClick={() => adjustStock(p, 1)} className={cn('flex h-6 w-6 items-center justify-center rounded border border-neutral-titanium/40 hover:border-accent-primary', accessibility.focusRing)}>
            <Plus size={12} aria-hidden="true" />
          </button>
          {p.stock <= p.lowStockThreshold && <StatusBadge tone="warning" label="Low" />}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end">
        <button type="button" onClick={openCreate} className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'text-body-sm')}>
          Add Product
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={products}
        getRowId={(p) => p.id}
        searchable
        searchPlaceholder="Search products…"
        searchKeys={['title', 'category']}
        emptyMessage="No products yet."
        rowActions={(p) => (
          <div className="flex items-center justify-end gap-1">
            <button type="button" aria-label={`Edit ${p.title}`} onClick={() => openEdit(p)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}>
              <Pencil size={14} aria-hidden="true" />
            </button>
            <button type="button" aria-label={`Delete ${p.title}`} onClick={() => setDeleteTarget(p)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}>
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      />

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? 'Edit Product' : 'Add Product'}
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField id="title" label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} required />
          <SelectField
            id="category"
            label="Category"
            value={form.category}
            onChange={(v) => setForm((f) => ({ ...f, category: v as ProductCategory }))}
            options={PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
          <SelectField
            id="grade"
            label="Grade"
            value={form.grade}
            onChange={(v) => setForm((f) => ({ ...f, grade: v as ProductGrade }))}
            options={(Object.keys(PRODUCT_GRADE_LABELS) as ProductGrade[]).map((g) => ({ label: PRODUCT_GRADE_LABELS[g], value: g }))}
          />
          <TextField id="price" label="Price" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
          <TextField id="originalPrice" label="Original price (optional)" type="number" value={form.originalPrice} onChange={(v) => setForm((f) => ({ ...f, originalPrice: v }))} />
          <TextField id="stock" label="Stock" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} required />
          <TextField id="lowStockThreshold" label="Low-stock threshold" type="number" value={form.lowStockThreshold} onChange={(v) => setForm((f) => ({ ...f, lowStockThreshold: v }))} />
          {error && <p className="text-body-sm font-body text-error">{error}</p>}
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
