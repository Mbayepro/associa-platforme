import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ExternalLink } from 'lucide-react';

export default async function PartnersPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Partenaires</h1>
          <p className="text-sm text-neutral-600">
            {partners?.length ?? 0} partenaire{(partners?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/partners/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Ajouter un partenaire
        </Link>
      </div>

      {!partners || partners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore aucun partenaire.
          </p>
          <Link
            href="/dashboard/partners/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Ajouter un partenaire
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Partenaire</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Site web</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900 flex items-center space-x-3">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-400">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span>{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] uppercase font-medium">
                      {p.partnership_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_active ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Actif</span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {p.website_url ? (
                      <a href={p.website_url} target="_blank" rel="noreferrer" className="flex items-center hover:text-brand-primary">
                        Lien <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
