-- =========================================================
-- ASSOCIA — Seed de démonstration : ADS
-- Association pour le Développement Social
-- IMPORTANT : ces données sont marquées is_demo = true
-- Elles ne créent PAS de compte OWNER automatiquement :
-- après inscription, l'utilisateur peut associer son compte
-- à cette organisation via la fonction ci-dessous.
-- =========================================================

insert into organizations (
  slug, name, description, email, phone, country, city,
  color_primary, color_secondary, tagline, is_demo, plan
) values (
  'ads',
  'ADS - Association pour le Développement Social',
  'Association sénégalaise engagée dans le développement social et environnemental.',
  'contact@ads-demo.org',
  '+221 77 000 00 00',
  'Sénégal',
  'Dakar',
  '#16A34A',
  '#1D4ED8',
  'Agir ensemble, planter l''avenir, bâtir le changement',
  true,
  'PRO'
)
on conflict (slug) do nothing;

-- Fonction utilitaire pour rattacher rapidement l'utilisateur courant
-- à l'organisation de démo ADS en tant qu'OWNER (usage : dev/démo uniquement)
create or replace function public.join_demo_ads_as_owner()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select id into v_org_id from organizations where slug = 'ads';

  if v_org_id is null then
    raise exception 'Organisation de démo ADS introuvable';
  end if;

  insert into organization_members (organization_id, user_id, role, status)
  values (v_org_id, auth.uid(), 'OWNER', 'ACTIVE')
  on conflict (organization_id, user_id)
  do update set role = 'OWNER', status = 'ACTIVE';
end;
$$;
