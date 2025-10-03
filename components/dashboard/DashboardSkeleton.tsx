"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton loading state for MetricsOverview
 */
export function MetricsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            {/* Mini chart skeleton */}
            <div className="mt-4 flex items-end gap-1 h-12">
              {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                <Skeleton key={j} className="flex-1 h-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Skeleton loading state for ActivitySummary
 */
export function ActivitySummarySkeleton() {
  return (
    <Card className="border border-gray-200 dark:border-slate-700">
      <CardHeader className="border-b border-gray-200 dark:border-slate-700">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loading state for QuickActions
 */
export function QuickActionsSkeleton() {
  return (
    <Card className="border border-gray-200 dark:border-slate-700">
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loading state for full dashboard page
 */
export function DashboardPageSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header skeleton */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6">
        <div>
          <Skeleton className="h-7 w-32 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* Welcome section skeleton */}
          <Card className="border border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </CardContent>
          </Card>

          {/* Metrics overview skeleton */}
          <MetricsOverviewSkeleton />

          {/* Main content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              <QuickActionsSkeleton />

              {/* Educational section skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-gray-200 dark:border-slate-700">
                    <CardHeader className="border-b border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-5 w-5 rounded" />
                          <Skeleton className="h-6 w-40" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 space-y-4">
              <ActivitySummarySkeleton />

              {/* Web3 metrics skeleton */}
              <Card className="border border-gray-200 dark:border-slate-700">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
