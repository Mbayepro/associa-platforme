import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionForm } from './action-form';

export default async function NewActionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get active profile for organization_id
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('active_organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.active_organization_id) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Créer une action</h1>
        <p className="text-sm text-neutral-600">
          Enregistrez une nouvelle action menée par votre association.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <ActionForm organizationId={profile.active_organization_id} />
      </div>
    </div>
  );
}
