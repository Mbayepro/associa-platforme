import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function TrainingsPage() {
  const supabase = await createClient();

  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, title, session_date, location, type, status')
    .order('session_date', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Formations</h1>
          <p className="text-sm text-neutral-600">
            {trainings?.length ?? 0} formation{(trainings?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/trainings/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Créer une formation
        </Link>
      </div>

      {!trainings || trainings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore aucune formation.
          </p>
          <Link
            href="/dashboard/trainings/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Créer une formation
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {trainings.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/trainings/${t.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand-primary"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-neutral-900">{t.title}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {t.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {new Date(t.session_date).toLocaleDateString('fr-FR')}
                {t.location ? ` · ${t.location}` : ''}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{t.type}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
