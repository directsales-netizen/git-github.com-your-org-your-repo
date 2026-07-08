'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { accessibility, cn, inputVariants } from '@/design';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyMessage?: string;
  rowActions?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  rows,
  getRowId,
  searchable,
  searchPlaceholder = 'Search…',
  searchKeys,
  pageSize = 10,
  emptyMessage = 'No results found.',
  rowActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchKeys || searchKeys.length === 0) return rows;
    const query = search.trim().toLowerCase();
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(query)));
  }, [rows, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.direction === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(column: Column<T>) {
    if (!column.sortValue) return;
    setSort((prev) => {
      if (prev?.key !== column.key) return { key: column.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: column.key, direction: 'desc' };
      return null;
    });
  }

  return (
    <div>
      {searchable && (
        <div className="relative mb-4 max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-silver" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className={cn(inputVariants.base, 'pl-9')}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-neutral-titanium/20">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-neutral-titanium/20 bg-bg-secondary">
                  {columns.map((column) => (
                    <th key={column.key} scope="col" className={cn('px-4 py-3 text-label-sm font-body font-semibold text-neutral-silver', column.className)}>
                      {column.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column)}
                          className={cn('flex items-center gap-1 hover:text-accent-primary', accessibility.focusRing)}
                        >
                          {column.header}
                          {sort?.key === column.key ? (
                            sort.direction === 'asc' ? (
                              <ArrowUp size={12} aria-hidden="true" />
                            ) : (
                              <ArrowDown size={12} aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" aria-hidden="true" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  ))}
                  {rowActions && <th scope="col" className="px-4 py-3 text-right text-label-sm font-body font-semibold text-neutral-silver">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={getRowId(row)} className="border-b border-neutral-titanium/10 last:border-0 hover:bg-bg-secondary/50">
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 text-body-sm font-body text-neutral-light-gray', column.className)}>
                        {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                      </td>
                    ))}
                    {rowActions && <td className="px-4 py-3 text-right">{rowActions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-body-sm font-body text-neutral-silver">
              <p>
                Page {currentPage} of {totalPages} ({sorted.length} results)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-md hover:bg-bg-secondary disabled:opacity-40', accessibility.focusRing)}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-md hover:bg-bg-secondary disabled:opacity-40', accessibility.focusRing)}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
