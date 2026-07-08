import { getSiteContent } from '@/lib/admin/content';
import { getTestimonials } from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import ContentClient from './ContentClient';

export default async function AdminContentPage() {
  const [content, testimonials] = await Promise.all([getSiteContent(), getTestimonials()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Website Content" description="Edit homepage copy and manage testimonials shown on the storefront." />
      <ContentClient initialContent={content} initialTestimonials={testimonials} />
    </div>
  );
}
