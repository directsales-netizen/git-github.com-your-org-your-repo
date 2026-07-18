'use client';

import { Star } from 'lucide-react';
import type { Testimonial } from '@/types/testimonial';
import { cn, spacing } from '@/design';
import Fade from '@/components/animations/Fade';
import GlassCard from '@/components/animations/GlassCard';

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const featuredTestimonials = testimonials.slice(0, 3);

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative isolate scroll-mt-24 overflow-hidden border-y border-neutral-titanium/15 bg-bg-primary/35 py-24 tablet:py-28 desktop:py-32"
    >
      <div className={cn(spacing.containerPadding, 'mx-auto max-w-[1440px]')}>
        <Fade variant="up">
          <p className="text-center text-label-sm font-body font-semibold uppercase text-accent-primary">Testimonials</p>
          <h2 id="testimonials-heading" className="mt-3 text-center text-[clamp(2.4rem,4.8vw,4.2rem)] font-heading font-bold leading-none text-neutral-white">
            What our community says
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-body-lg font-body leading-8 text-neutral-silver">
            Real feedback from customers who upgraded their setup with Premium TechNoir.
          </p>
        </Fade>

        <div className="mt-14 grid grid-cols-1 gap-4 tablet:grid-cols-3">
          {featuredTestimonials.map((testimonial, index) => (
            <Fade key={testimonial.id} variant="up" transition={{ delay: index * 0.09 }}>
              <GlassCard
                className="h-full rounded-lg border-accent-primary/15 bg-bg-secondary/75 p-7 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
                role="group"
                aria-label={`Testimonial from ${testimonial.name}`}
              >
                <div className="flex items-center gap-1" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < testimonial.rating ? 'fill-accent-primary text-accent-primary' : 'text-neutral-titanium'}
                    />
                  ))}
                </div>

                <blockquote className="mt-5 text-body-md font-body leading-8 text-neutral-light-gray">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div className="mt-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent-primary/25 bg-accent-primary/10 text-label-sm font-body font-semibold text-accent-primary">
                    {testimonial.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-body-md font-body font-semibold text-neutral-white">{testimonial.name}</p>
                    <p className="text-body-sm font-body text-neutral-silver">{testimonial.location} &middot; {testimonial.device}</p>
                  </div>
                </div>
              </GlassCard>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
