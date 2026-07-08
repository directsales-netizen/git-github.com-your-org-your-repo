import Hero from '@/components/sections/Hero';
import WhyChoose from '@/components/sections/WhyChoose';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Testimonials from '@/components/sections/Testimonials';
import Sustainability from '@/components/sections/Sustainability';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import { getTestimonials } from '@/lib/api';
import { getSiteContent } from '@/lib/admin/content';

export default async function HomePage() {
  const [testimonials, content] = await Promise.all([getTestimonials(), getSiteContent()]);

  return (
    <>
      <Hero
        headline={content.heroHeadline}
        subheadline={content.heroSubheadline}
        ctaLabel={content.heroCtaLabel}
        promoBannerEnabled={content.promoBannerEnabled}
        promoBannerText={content.promoBannerText}
      />
      <WhyChoose />
      <FeaturedProducts />
      <Testimonials testimonials={testimonials} />
      <Sustainability />
      <NewsletterSignup />
    </>
  );
}
