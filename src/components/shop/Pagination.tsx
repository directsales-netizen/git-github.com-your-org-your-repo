import Link from 'next/link';
import { accessibility, cn } from '@/design';

type SearchParamsInput = Record<string, string | string[] | undefined>;

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams: SearchParamsInput;
}

function buildHref(searchParams: SearchParamsInput, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page' || value === undefined) continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (first) params.set(key, first);
  }
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

export default function Pagination({ page, totalPages, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const boundaryClasses = 'rounded-md px-4 py-2 text-body-sm font-body';

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          href={buildHref(searchParams, page - 1)}
          className={cn(boundaryClasses, 'text-neutral-light-gray transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing)}
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(boundaryClasses, 'text-neutral-gray')}>
          Previous
        </span>
      )}

      <div className="flex items-center gap-1">
        {pageNumbers.map((number) =>
          number === page ? (
            <span
              key={number}
              aria-current="page"
              className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-primary text-body-sm font-body font-semibold text-bg-primary"
            >
              {number}
            </span>
          ) : (
            <Link
              key={number}
              href={buildHref(searchParams, number)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-md text-body-sm font-body text-neutral-light-gray transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary',
                accessibility.focusRing
              )}
            >
              {number}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link
          href={buildHref(searchParams, page + 1)}
          className={cn(boundaryClasses, 'text-neutral-light-gray transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing)}
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(boundaryClasses, 'text-neutral-gray')}>
          Next
        </span>
      )}
    </nav>
  );
}
