'use client';

import { useHealth } from '@/lib/api/queries';
import { useDemoStore } from '@/stores/useDemoStore';

export default function HomePage() {
  const { data, isLoading, error } = useHealth();
  const { count, inc, reset } = useDemoStore();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">DemoDay Front</h1>

      <section className="space-y-2">
        <h2 className="font-semibold">React Query / axios</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-600">Error: {(error as Error).message}</p>}
        {data && (
          <pre className="rounded bg-gray-100 p-4">{JSON.stringify(data, null, 2)}</pre>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Zustand</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono">count: {count}</span>
          <button className="px-2 py-1 rounded bg-black text-white" onClick={inc}>+1</button>
          <button className="px-2 py-1 rounded border" onClick={reset}>reset</button>
        </div>
      </section>
    </main>
  );
}
