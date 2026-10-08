import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RegisterMemberToEventForm } from './register-member-form';
import { RegistrationTable } from '../../components/registration-table';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*, organizations(name, logo_url)')
    .eq('id', id)
    .maybeSingle();

  if (!event) notFound();

  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('event_id', id);

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select('id, status, members(id, first_name, last_name, member_number)')
    .eq('event_id', id);

  const { data: allMembers } = await supabase
    .from('members')
    .select('id, first_name, last_name')
    .is('deleted_at', null);

  const registeredIds = new Set(
    (registrations ?? []).map((r: any) => r.members?.id)
  );
  const availableMembers = (allMembers ?? []).filter(
    (m) => !registeredIds.has(m.id)
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{event.title}</h1>
        <p className="text-sm text-neutral-600">
          {new Date(event.event_date).toLocaleDateString('fr-FR')}
          {event.location ? ` · ${event.location}` : ''}
          {event.organizer ? ` · Organisé par ${event.organizer}` : ''}
        </p>
      </div>

      {event.description && (
        <p className="text-sm text-neutral-700">{event.description}</p>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-medium">
          Inscriptions ({registrations?.length ?? 0})
        </h2>

        <RegisterMemberToEventForm eventId={id} availableMembers={availableMembers} />

        <RegistrationTable 
          registrations={registrations || []}
          certificates={certificates || []}
          sourceId={id}
          sourceType="EVENT"
          title={event.title}
          orgId={event.organization_id}
          orgName={event.organizations?.name}
          orgLogo={event.organizations?.logo_url}
        />
      </div>

      <a
        href={`/dashboard/scan?type=EVENT&id=${id}`}
        className="inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Ouvrir le scanner de présence pour cet événement
      </a>
    </div>
  );
}
