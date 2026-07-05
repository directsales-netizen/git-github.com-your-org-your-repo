import Hero from '@/components/sections/Hero';
import WhyChoose from '@/components/sections/WhyChoose';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import Testimonials from '@/components/sections/Testimonials';
import Sustainability from '@/components/sections/Sustainability';
import NewsletterSignup from '@/components/sections/NewsletterSignup';
import { getTestimonials } from '@/lib/api';

export default async function HomePage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Hero />
      <WhyChoose />
      <FeaturedProducts />
      <Testimonials testimonials={testimonials} />
      <Sustainability />
      <NewsletterSignup />
    </>
  );
}
