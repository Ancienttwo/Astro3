"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function ClientHealth() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/health', { cache: 'no-store' });
      return res.json();
    },
    staleTime: 30_000,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing...' : 'Refetch'}
        </button>
        <span className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : 'Loaded'}
        </span>
      </div>
      {error && <div className="text-red-600">{(error as any)?.message ?? 'Error'}</div>}
      <pre className="bg-muted p-4 rounded overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

