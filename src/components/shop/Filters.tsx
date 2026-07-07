'use client';

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { PRODUCT_CATEGORIES, type ProductGrade } from '@/types/product';
import { accessibility, buttonVariants, cn, inputVariants } from '@/design';

const GRADES: ProductGrade[] = ['A', 'B', 'C', 'D'];

interface FilterState {
  search: string;
  category: string;
  grade: string;
  priceMin: string;
  priceMax: string;
}

export default function Filters({
  showCategoryFilter = true,
  clearAllHref = '/shop',
}: {
  showCategoryFilter?: boolean;
  clearAllHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<FilterState>({
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    grade: searchParams.get('grade') ?? '',
    priceMin: searchParams.get('priceMin') ?? '',
    priceMax: searchParams.get('priceMax') ?? '',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsDrawerOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (state.search.trim()) params.set('search', state.search.trim());
    if (state.category) params.set('category', state.category);
    if (state.grade) params.set('grade', state.grade);
    if (state.priceMin) params.set('priceMin', state.priceMin);
    if (state.priceMax) params.set('priceMax', state.priceMax);

    const currentSort = searchParams.get('sort');
    if (currentSort) params.set('sort', currentSort);

    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    setIsDrawerOpen(false);
  }

  return (
    <>
      <div className="tablet:hidden">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-expanded={isDrawerOpen}
          aria-controls="shop-filter-drawer"
          className={cn(buttonVariants.ghost, 'inline-flex items-center gap-2 px-4 py-2.5 text-body-sm', accessibility.focusRing)}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filters
        </button>
      </div>

      <form onSubmit={applyFilters} className="hidden tablet:block" aria-label="Filter products">
        <FilterFields
          state={state}
          setState={setState}
          showCategoryFilter={showCategoryFilter}
          clearAllHref={clearAllHref}
        />
      </form>

      {isDrawerOpen && (
        <div
          id="shop-filter-drawer"
          className="fixed inset-0 z-modal tablet:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
          />
          <form
            onSubmit={applyFilters}
            className="absolute right-0 top-0 flex h-full w-full max-w-xs flex-col overflow-y-auto bg-bg-secondary p-6 shadow-elevation"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-label-md font-body font-semibold text-neutral-white">Filters</span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsDrawerOpen(false)}
                className={cn('rounded-md p-3 text-neutral-light-gray hover:text-accent-primary', accessibility.focusRing)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <FilterFields
              state={state}
              setState={setState}
              firstFieldRef={firstFieldRef}
              showCategoryFilter={showCategoryFilter}
              clearAllHref={clearAllHref}
            />
          </form>
        </div>
      )}
    </>
  );
}

function FilterFields({
  state,
  setState,
  firstFieldRef,
  showCategoryFilter,
  clearAllHref,
}: {
  state: FilterState;
  setState: (updater: (state: FilterState) => FilterState) => void;
  firstFieldRef?: RefObject<HTMLInputElement | null>;
  showCategoryFilter: boolean;
  clearAllHref: string;
}) {
  return (
    <>
      <div>
        <input
          ref={firstFieldRef}
          type="search"
          aria-label="Search devices"
          placeholder="Search devices..."
          value={state.search}
          onChange={(event) => {
            const { value } = event.target;
            setState((current) => ({ ...current, search: value }));
          }}
          className={cn(inputVariants.base, 'mt-2')}
        />
      </div>

      {showCategoryFilter && (
        <fieldset className="mt-6">
          <legend className="text-label-sm font-body font-semibold text-neutral-white">Category</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterPill
              name="category"
              label="All"
              checked={state.category === ''}
              onSelect={() => setState((current) => ({ ...current, category: '' }))}
            />
            {PRODUCT_CATEGORIES.map((category) => (
              <FilterPill
                key={category}
                name="category"
                label={category}
                checked={state.category === category}
                onSelect={() => setState((current) => ({ ...current, category }))}
              />
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-6">
        <legend className="text-label-sm font-body font-semibold text-neutral-white">Condition Grade</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterPill
            name="grade"
            label="All"
            checked={state.grade === ''}
            onSelect={() => setState((current) => ({ ...current, grade: '' }))}
          />
          {GRADES.map((grade) => (
            <FilterPill
              key={grade}
              name="grade"
              label={grade}
              checked={state.grade === grade}
              onSelect={() => setState((current) => ({ ...current, grade }))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-label-sm font-body font-semibold text-neutral-white">Price Range</legend>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label="Minimum price"
            placeholder="Min"
            value={state.priceMin}
            onChange={(event) => {
              const { value } = event.target;
              setState((current) => ({ ...current, priceMin: value }));
            }}
            className={cn(inputVariants.base, 'w-full')}
          />
          <span className="text-body-sm font-body text-neutral-silver" aria-hidden="true">
            &ndash;
          </span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            aria-label="Maximum price"
            placeholder="Max"
            value={state.priceMax}
            onChange={(event) => {
              const { value } = event.target;
              setState((current) => ({ ...current, priceMax: value }));
            }}
            className={cn(inputVariants.base, 'w-full')}
          />
        </div>
      </fieldset>

      <div className="mt-6 flex items-center gap-3">
        <button type="submit" className={cn(buttonVariants.primary, 'px-6 py-2.5 text-body-sm')}>
          Apply Filters
        </button>
        <Link
          href={clearAllHref}
          className={cn(buttonVariants.ghost, 'inline-flex items-center justify-center px-6 py-2.5 text-body-sm')}
        >
          Clear All
        </Link>
      </div>
    </>
  );
}

function FilterPill({
  name,
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="peer sr-only" />
      <span
        className={cn(
          buttonVariants.secondary,
          'inline-flex items-center px-3 py-1.5 text-body-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary-primary',
          checked && 'border-secondary-primary bg-secondary-primary'
        )}
      >
        {label}
      </span>
    </label>
  );
}
