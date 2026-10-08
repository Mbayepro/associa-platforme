import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Activity } from 'lucide-react';

export default async function ImpactPage() {
  const supabase = await createClient();

  const { data: metrics } = await (supabase.from('impact_metrics') as any)
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Impact</h1>
          <p className="text-sm text-neutral-600">
            Mesures d'impact et statistiques de l'organisation
          </p>
        </div>
        <Link
          href="/dashboard/impact/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Ajouter une métrique
        </Link>
      </div>

      {!metrics || metrics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Aucune métrique d'impact définie.
          </p>
          <Link
            href="/dashboard/impact/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Ajouter une métrique
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric: any) => (
            <div key={metric.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {metric.value} <span className="text-base font-normal text-neutral-500">{metric.unit}</span>
                  </p>
                </div>
              </div>
              {metric.description && (
                <p className="mt-3 text-sm text-neutral-500">{metric.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
