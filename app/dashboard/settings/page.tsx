import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SettingsClient } from './settings-client';
import { DemoDataGenerator } from '@/components/demo-data-generator';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'OWNER')) redirect('/dashboard');

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .maybeSingle() as any;

  if (!org) redirect('/dashboard');

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Paramètres de l'organisation</h1>
        <p className="mt-1 text-sm font-medium text-neutral-500">
          Gérez les informations et l'apparence de votre organisation.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 premium-shadow">
        <SettingsClient 
          orgId={org.id} 
          currentLogo={org.logo_url} 
          currentName={org.name}
          currentSlug={org.slug}
          currentMemberPrefix={org.member_prefix}
          currentColorPrimary={org.color_primary}
          currentColorSecondary={org.color_secondary}
        />
      </div>

      <DemoDataGenerator orgId={org.id} />
    </div>
  );
}
