import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ScannerClient } from './scanner-client';

export default async function ScanPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role, organizations(id)')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/onboarding');

  const orgId = (membership.organizations as any).id;

  // Fetch active trainings and events for this org
  const { data: trainings } = await supabase
    .from('trainings')
    .select('id, title')
    .eq('organization_id', orgId)
    .eq('status', 'PUBLISHED');

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .eq('organization_id', orgId)
    .eq('status', 'PUBLISHED');

  return (
    <Suspense fallback={null}>
      <ScannerClient 
        availableTrainings={trainings || []} 
        availableEvents={events || []} 
      />
    </Suspense>
  );
}
