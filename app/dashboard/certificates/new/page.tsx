import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewCertificateForm } from './new-certificate-form';

export default async function NewCertificatePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/onboarding');

  // Fetch active members to populate the select dropdown
  const { data: members } = await supabase
    .from('members')
    .select('id, first_name, last_name, member_number')
    .is('deleted_at', null)
    .eq('status', 'ACTIVE')
    .order('last_name', { ascending: true });

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Délivrer une attestation</h1>
        <p className="text-sm text-neutral-600">
          Sélectionnez un membre et générez une attestation vérifiable publiquement.
        </p>
      </div>
      <NewCertificateForm 
        organizationId={membership.organization_id} 
        members={members || []} 
      />
    </div>
  );
}
