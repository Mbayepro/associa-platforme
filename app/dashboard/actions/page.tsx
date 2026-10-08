import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ActionsPage() {
  const supabase = await createClient();

  const { data: actions } = await (supabase.from('actions') as any)
    .select('id, title, type, date, location')
    .order('date', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Actions</h1>
          <p className="text-sm text-neutral-600">
            {actions?.length ?? 0} action{(actions?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/actions/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Créer une action
        </Link>
      </div>

      {!actions || actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore enregistré aucune action.
          </p>
          <Link
            href="/dashboard/actions/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Créer une action
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((a: any) => (
            <Link
              key={a.id}
              href={`/dashboard/actions/${a.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand-primary"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-neutral-900">{a.title}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {a.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {a.date ? new Date(a.date).toLocaleDateString('fr-FR') : 'Date non définie'}
                {a.location ? ` · ${a.location}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
