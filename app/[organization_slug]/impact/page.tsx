import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ExternalLink } from 'lucide-react';

export default async function PublicImpactPage({
  params,
}: {
  params: Promise<{ organization_slug: string }>;
}) {
  const { organization_slug } = await params;
  const supabase = await createClient();

  const { data, error } = await (supabase.rpc as any)('get_organization_public_impact', {
    p_slug: organization_slug
  });

  const result = data as any;

  if (error || !result || !result.found) {
    notFound();
  }

  const org = result.organization;
  const actions = result.actions;
  const metrics = result.metrics;
  const partners = result.partners;

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-12 py-12">
      <header className="text-center space-y-4">
        {org.logo_url && (
          <img src={org.logo_url} alt={org.name} className="mx-auto h-24 w-24 rounded-2xl object-cover shadow-sm" />
        )}
        <h1 className="text-3xl font-bold text-neutral-900">L'impact de {org.name}</h1>
        {org.description && <p className="text-neutral-600 max-w-2xl mx-auto">{org.description}</p>}
      </header>

      {metrics && metrics.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-center">Nos chiffres clés</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m: any, i: number) => (
              <div key={i} className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-6 text-center flex flex-col justify-center">
                <span className="text-3xl font-bold text-brand-primary mb-1">{m.value}</span>
                <span className="text-sm font-medium text-neutral-700">{m.title}</span>
                {m.unit && <span className="text-xs text-neutral-500 mt-1">{m.unit}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {actions && actions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Nos dernières actions</h2>
          <div className="space-y-4">
            {actions.map((a: any, i: number) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <span className="self-start sm:self-auto rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                    {a.type}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mb-3">
                  {a.date ? new Date(a.date).toLocaleDateString('fr-FR') : ''}
                  {a.date && a.location ? ' · ' : ''}
                  {a.location}
                </p>
                {a.description && <p className="text-sm text-neutral-700">{a.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {partners && partners.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-center">Nos partenaires</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {partners.map((p: any, i: number) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 w-32 text-center">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="h-16 w-16 object-contain mb-3" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center text-lg font-bold text-neutral-400 mb-3">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-neutral-900 mb-1">{p.name}</span>
                <span className="text-[10px] uppercase font-semibold text-neutral-500">{p.partnership_type}</span>
                {p.website_url && (
                  <a href={p.website_url} target="_blank" rel="noreferrer" className="mt-2 text-brand-primary hover:text-brand-primary/80">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
