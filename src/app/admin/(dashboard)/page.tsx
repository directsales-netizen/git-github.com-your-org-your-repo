import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { getAnalyticsOverview } from '@/lib/admin/analytics';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import RevenueByCategoryChart from '@/components/admin/charts/RevenueByCategoryChart';
import RevenueTrendChart from '@/components/admin/charts/RevenueTrendChart';

export default async function AdminAnalyticsPage() {
  const overview = await getAnalyticsOverview();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Sales, revenue, visitors, and conversions at a glance. Figures below are a seeded demo dataset — see the note on each chart."
      />

      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={`$${overview.revenue.total.toLocaleString()}`}
          delta={{ value: Math.abs(overview.revenue.deltaPercent), direction: overview.revenue.deltaPercent >= 0 ? 'up' : 'down' }}
          icon={DollarSign}
          sparkline={overview.revenue.sparkline}
        />
        <StatCard
          label="Sales (30d)"
          value={overview.sales.total.toLocaleString()}
          delta={{ value: Math.abs(overview.sales.deltaPercent), direction: overview.sales.deltaPercent >= 0 ? 'up' : 'down' }}
          icon={ShoppingBag}
          sparkline={overview.sales.sparkline}
        />
        <StatCard
          label="Visitors (30d)"
          value={overview.visitors.total.toLocaleString()}
          delta={{ value: Math.abs(overview.visitors.deltaPercent), direction: overview.visitors.deltaPercent >= 0 ? 'up' : 'down' }}
          icon={Users}
          sparkline={overview.visitors.sparkline}
        />
        <StatCard
          label="Conversion rate"
          value={`${overview.conversionRate.value}%`}
          delta={{ value: Math.abs(overview.conversionRate.deltaPercent), direction: overview.conversionRate.deltaPercent >= 0 ? 'up' : 'down' }}
          icon={TrendingUp}
          sparkline={overview.conversionRate.sparkline}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
        <RevenueTrendChart data={overview.revenueTrend} />
        <RevenueByCategoryChart data={overview.revenueByCategory} />
      </div>
    </div>
  );
}
