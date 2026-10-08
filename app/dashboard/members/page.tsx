import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from('members')
    .select('id, member_number, first_name, last_name, function, status')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Membres</h1>
          <p className="text-sm text-neutral-600">
            {members?.length ?? 0} membre{(members?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Ajouter un membre
        </Link>
      </div>

      {!members || members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore aucun membre.
          </p>
          <Link
            href="/dashboard/members/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Ajouter un membre
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Numéro</th>
                <th className="px-4 py-3 font-medium">Fonction</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {m.first_name} {m.last_name}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{m.member_number}</td>
                  <td className="px-4 py-3 text-neutral-600">{m.function ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/members/${m.id}`}
                      className="text-sm font-medium text-brand-primary"
                    >
                      Voir
                    </Link>
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
