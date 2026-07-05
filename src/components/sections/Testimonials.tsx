'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Testimonial } from '@/types/testimonial';
import { accessibility, cn, spacing } from '@/design';

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;
  const active = testimonials[index];

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <h2 className="text-center text-h2 font-heading font-bold text-neutral-white">What Our Customers Say</h2>

      <div className="mx-auto mt-10 max-w-2xl">
        <div
          key={active.id}
          className="animate-in fade-in rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-8 text-center duration-300"
          role="group"
          aria-roledescription="slide"
          aria-label={`Testimonial ${index + 1} of ${testimonials.length}`}
        >
          <div className="flex items-center justify-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                className={i < active.rating ? 'fill-accent-primary text-accent-primary' : 'text-neutral-titanium'}
              />
            ))}
          </div>

          <p className="mt-4 text-body-lg font-body italic text-neutral-light-gray">&ldquo;{active.quote}&rdquo;</p>

          <p className="mt-6 text-body-md font-body font-semibold text-neutral-white">{active.name}</p>
          <p className="text-body-sm font-body text-neutral-silver">{active.location} &middot; {active.device}</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous testimonial"
            onClick={() => setIndex((current) => (current - 1 + testimonials.length) % testimonials.length)}
            className={cn('rounded-md p-2 text-neutral-silver transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing)}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <div className="flex gap-2" role="tablist" aria-label="Select testimonial">
            {testimonials.map((testimonial, i) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors duration-300',
                  i === index ? 'bg-accent-primary' : 'bg-neutral-titanium',
                  accessibility.focusRing
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next testimonial"
            onClick={() => setIndex((current) => (current + 1) % testimonials.length)}
            className={cn('rounded-md p-2 text-neutral-silver transition-colors duration-300 hover:text-accent-primary', accessibility.focusRing)}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
