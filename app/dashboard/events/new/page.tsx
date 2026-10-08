import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewEventForm } from './new-event-form';

export default async function NewEventPage() {
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
      <h1 className="text-xl font-semibold">Créer un événement</h1>
      <NewEventForm organizationId={membership.organization_id} />
    </div>
  );
}
