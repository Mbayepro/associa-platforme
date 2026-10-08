import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CardsClient } from './cards-client';

export const dynamic = 'force-dynamic';

export default async function CardsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;
  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : 'ALL';
  const search = typeof searchParams.q === 'string' ? searchParams.q : '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(name, color_primary, color_secondary, logo_url, tagline)')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/onboarding');
  const orgId = membership.organization_id;
  const org = (membership as any).organizations;

  const ITEMS_PER_PAGE = 20;
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('member_cards')
    .select('*, members!inner(first_name, last_name, member_number, function, phone, photo_url)', { count: 'exact' })
    .eq('members.organization_id', orgId);

  if (statusFilter !== 'ALL') {
    query = query.eq('status', statusFilter);
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,member_number.ilike.%${search}%`, { referencedTable: 'members' });
  }

  const { data: cards, count, error } = await query
    .order('issued_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Cartes de membres</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez et imprimez les cartes de vos membres.
          </p>
        </div>
      </div>

      <CardsClient 
        initialCards={cards as any[] || []} 
        orgId={orgId}
        orgName={org.name}
        orgLogo={org.logo_url}
        orgTagline={org.tagline}
        colorPrimary={org.color_primary}
        colorSecondary={org.color_secondary}
        totalPages={totalPages}
        currentPage={page}
        statusFilter={statusFilter}
        searchQuery={search}
        totalCount={count || 0}
      />
    </div>
  );
}
