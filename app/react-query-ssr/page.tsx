import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { headers } from 'next/headers';
import ClientHealth from './ClientHealth';

async function prefetchHealth(queryClient: QueryClient) {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;

  await queryClient.prefetchQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${base}/api/health`, { cache: 'no-store' });
      return res.json();
    },
    staleTime: 30_000,
  });
}

export default async function Page() {
  const queryClient = new QueryClient();
  await prefetchHealth(queryClient);
  const dehydratedState = dehydrate(queryClient);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">SSR + Hydration Demo</h1>
      <HydrationBoundary state={dehydratedState}>
        <ClientHealth />
      </HydrationBoundary>
    </div>
  );
}

