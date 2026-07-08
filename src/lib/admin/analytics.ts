import { getAllProductsAdmin } from '@/lib/api';
import type { ProductCategory } from '@/types/product';

/**
 * No real pageview/order-volume tracking exists in this app (see
 * CHAT_ASSISTANT_ARCHITECTURE.md for the same honesty note on the AI
 * assistant's mock data). Revenue/sales/visitor/conversion series below are
 * a deterministic, seeded synthetic dataset — not random on every request,
 * but not live tracking either. "Revenue by category" is a real-data
 * estimate (price × a popularity-derived demand proxy) computed from the
 * actual mock catalog, not independently invented. Marked in the UI as demo
 * data.
 */

interface DailyPoint {
  date: string;
  value: number;
}

interface MetricSeries {
  total: number;
  deltaPercent: number;
  sparkline: number[];
}

export interface AnalyticsOverview {
  revenue: MetricSeries;
  sales: MetricSeries;
  visitors: MetricSeries;
  conversionRate: { value: number; deltaPercent: number; sparkline: number[] };
  revenueByCategory: { category: ProductCategory; revenue: number }[];
  revenueTrend: DailyPoint[];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSeries(seedBase: number, days: number, base: number, variance: number): number[] {
  const series: number[] = [];
  for (let i = 0; i < days; i += 1) {
    const noise = seededRandom(seedBase + i * 7.13);
    series.push(Math.round(base + (noise - 0.5) * variance + Math.sin(i / 4) * variance * 0.3));
  }
  return series;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function deltaPercent(values: number[]): number {
  const midpoint = Math.floor(values.length / 2);
  const recent = sum(values.slice(midpoint));
  const prior = sum(values.slice(0, midpoint)) || 1;
  return Math.round(((recent - prior) / prior) * 1000) / 10;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const DAYS = 30;
  const revenueSeries = generateSeries(1, DAYS, 4200, 1400).map((v) => Math.max(0, v));
  const salesSeries = generateSeries(2, DAYS, 38, 14).map((v) => Math.max(0, v));
  const visitorSeries = generateSeries(3, DAYS, 620, 180).map((v) => Math.max(0, v));
  const conversionSeries = generateSeries(4, DAYS, 3.2, 0.8).map((v) => Math.max(0.5, Math.round(v * 10) / 10));

  const products = await getAllProductsAdmin();
  const byCategory = new Map<ProductCategory, number>();
  for (const product of products) {
    const demandProxy = Math.max(1, Math.round(product.popularity / 8));
    byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + product.price * demandProxy);
  }
  const revenueByCategory = [...byCategory.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const today = new Date();
  const revenueTrend: DailyPoint[] = revenueSeries.map((value, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (DAYS - 1 - index));
    return { date: date.toISOString().slice(0, 10), value };
  });

  return {
    revenue: { total: sum(revenueSeries), deltaPercent: deltaPercent(revenueSeries), sparkline: revenueSeries.slice(-10) },
    sales: { total: sum(salesSeries), deltaPercent: deltaPercent(salesSeries), sparkline: salesSeries.slice(-10) },
    visitors: { total: sum(visitorSeries), deltaPercent: deltaPercent(visitorSeries), sparkline: visitorSeries.slice(-10) },
    conversionRate: {
      value: conversionSeries[conversionSeries.length - 1],
      deltaPercent: deltaPercent(conversionSeries),
      sparkline: conversionSeries.slice(-10),
    },
    revenueByCategory,
    revenueTrend,
  };
}
