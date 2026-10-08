import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RegisterMemberForm } from './register-member-form';
import { RegistrationTable } from '../../components/registration-table';

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: training } = await supabase
    .from('trainings')
    .select('*, organizations(name, logo_url)')
    .eq('id', id)
    .maybeSingle();

  if (!training) notFound();

  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('training_id', id);

  const { data: registrations } = await supabase
    .from('formation_registrations')
    .select('id, status, members(id, first_name, last_name, member_number)')
    .eq('training_id', id);

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
        <h1 className="text-xl font-semibold">{training.title}</h1>
        <p className="text-sm text-neutral-600">
          {new Date(training.session_date).toLocaleDateString('fr-FR')}
          {training.location ? ` · ${training.location}` : ''}
          {training.trainer ? ` · Formateur : ${training.trainer}` : ''}
        </p>
      </div>

      {training.description && (
        <p className="text-sm text-neutral-700">{training.description}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">
            Inscriptions ({registrations?.length ?? 0})
          </h2>
        </div>

        <RegisterMemberForm trainingId={id} availableMembers={availableMembers} />

        <RegistrationTable 
          registrations={registrations || []}
          certificates={certificates || []}
          sourceId={id}
          sourceType="TRAINING"
          title={training.title}
          orgId={training.organization_id}
          orgName={training.organizations?.name}
          orgLogo={training.organizations?.logo_url}
        />
      </div>

      <a
        href={`/dashboard/scan?type=FORMATION&id=${id}`}
        className="inline-block rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Ouvrir le scanner de présence pour cette formation
      </a>
    </div>
  );
}
