import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewPartnerForm } from './new-partner-form';

export default async function NewPartnerPage() {
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

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Ajouter un partenaire</h1>
        <p className="text-sm text-neutral-600">
          Enregistrez un nouveau sponsor, mécène ou partenaire institutionnel.
        </p>
      </div>
      <NewPartnerForm organizationId={membership.organization_id} />
    </div>
  );
}
