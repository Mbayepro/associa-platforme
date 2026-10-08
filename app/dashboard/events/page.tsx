import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from('events')
    .select('id, title, event_date, location, event_type, status')
    .order('event_date', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Événements</h1>
          <p className="text-sm text-neutral-600">
            {events?.length ?? 0} événement{(events?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Créer un événement
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore aucun événement.
          </p>
          <Link
            href="/dashboard/events/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Créer un événement
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {events.map((e) => (
            <Link
              key={e.id}
              href={`/dashboard/events/${e.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-brand-primary"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-neutral-900">{e.title}</p>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {e.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {new Date(e.event_date).toLocaleDateString('fr-FR')}
                {e.location ? ` · ${e.location}` : ''}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{e.event_type}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
