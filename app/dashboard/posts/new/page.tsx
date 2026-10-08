import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewNewsForm } from './new-news-form';

export default async function NewNewsPage() {
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
        <h1 className="text-xl font-semibold">Rédiger un article</h1>
        <p className="text-sm text-neutral-600">
          Publiez des actualités pour informer vos membres et partenaires.
        </p>
      </div>
      <NewNewsForm organizationId={membership.organization_id} userId={user.id} />
    </div>
  );
}
