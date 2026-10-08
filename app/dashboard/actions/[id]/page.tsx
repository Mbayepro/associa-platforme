import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AddImpactMetricForm } from './add-impact-metric-form';

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: action } = await (supabase.from('actions') as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!action) notFound();

  const { data: metrics } = await (supabase.from('impact_metrics') as any)
    .select('*')
    .eq('action_id', id)
    .order('display_order', { ascending: true });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{action.title}</h1>
        <p className="text-sm text-neutral-600">
          {action.date ? new Date(action.date).toLocaleDateString('fr-FR') : 'Date non définie'}
          {action.location ? ` · ${action.location}` : ''}
          {` · Type : ${action.type}`}
        </p>
      </div>

      {action.description && (
        <p className="text-sm text-neutral-700">{action.description}</p>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-medium">Métriques d'impact</h2>

        <AddImpactMetricForm actionId={id} organizationId={action.organization_id} />

        {!metrics || metrics.length === 0 ? (
          <p className="text-sm text-neutral-500">Aucune métrique définie pour cette action.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Titre</th>
                  <th className="px-4 py-2 font-medium">Valeur</th>
                  <th className="px-4 py-2 font-medium">Unité</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m: any) => (
                  <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2 font-medium">{m.title}</td>
                    <td className="px-4 py-2">{m.value}</td>
                    <td className="px-4 py-2 text-neutral-500">{m.unit || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
