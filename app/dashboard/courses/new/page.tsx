import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewCourseForm } from './new-course-form';

export default async function NewCoursePage() {
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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Créer un cours (E-Learning)</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Définissez les informations de base de votre nouveau cours en ligne.
        </p>
      </div>
      <NewCourseForm organizationId={membership.organization_id} />
    </div>
  );
}
