import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingForm } from './onboarding-form';

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Si l'utilisateur appartient déjà à une organisation, direction le dashboard.
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Créez votre organisation</h1>
          <p className="text-sm text-neutral-600">
            Étape 2 sur 2 — ces informations pourront être modifiées plus
            tard.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
