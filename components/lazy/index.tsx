'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for charts
const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-64 w-full" />
  </div>
);

// Lazy load heavy chart components
export const LazyBaziChart = dynamic(
  () => import('@/components/fatebook/ChartCard').then(mod => mod.default),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyChartList = dynamic(
  () => import('@/components/fatebook/ChartList').then(mod => mod.default),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyZiweiChart = dynamic(
  () => import('@/components/fatebook/ZiweiChart').then(mod => mod.default),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// Lazy load admin components
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
  }
);

// Lazy load analytics components
export const LazyAnalyticsChart = dynamic(
  () => import('@/components/ui/chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);