-- Drop the overly permissive public select policies
drop policy if exists "Public can view actions" on actions;
drop policy if exists "Public can view impact metrics" on impact_metrics;
drop policy if exists "Public can view active partners" on partners;
drop policy if exists "Public can view published news" on posts;

-- Replace with strict tenant isolation (only members can read their org's data)
create policy "Users can view actions of their org"
  on actions for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Users can view impact metrics of their org"
  on impact_metrics for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Users can view partners of their org"
  on partners for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Users can view posts of their org"
  on posts for select
  using (public.is_org_member(auth.uid(), organization_id));

-- Add SECURITY DEFINER function for the public impact page
create or replace function public.get_organization_public_impact(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_org record;
  v_result jsonb;
begin
  select id, name, description, logo_url
  into v_org
  from organizations
  where slug = p_slug and status = 'ACTIVE';

  if v_org.id is null then
    return jsonb_build_object('found', false);
  end if;

  select jsonb_build_object(
    'found', true,
    'organization', jsonb_build_object(
      'name', v_org.name, 'description', v_org.description,
      'logo_url', v_org.logo_url
    ),
    'actions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', title, 'type', type, 'description', description,
        'date', date, 'location', location
      )), '[]'::jsonb)
      from actions where organization_id = v_org.id
    ),
    'metrics', (
      select coalesce(jsonb_agg(jsonb_build_object('title', title, 'value', value, 'unit', unit)), '[]'::jsonb)
      from impact_metrics where organization_id = v_org.id
    ),
    'partners', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'logo_url', logo_url, 'partnership_type', partnership_type, 'website_url', website_url)), '[]'::jsonb)
      from partners where organization_id = v_org.id and is_active = true
    )
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_organization_public_impact(text) to anon, authenticated;
