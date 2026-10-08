-- =========================================================
-- ASSOCIA — Migration 0003 : Membres + Cartes + Vérification
-- =========================================================

create type member_status as enum ('ACTIVE', 'INACTIVE', 'SUSPENDED');
create type card_status as enum ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED');

-- =========================================================
-- 1. Compteur de numérotation par organisation
-- =========================================================
-- Un compteur dédié (plutôt qu'un simple count(*) sur members) pour
-- rester correct même après suppression de membres (soft delete).

alter table organizations
  add column member_sequence integer not null default 0;

-- =========================================================
-- 2. TABLE members (entité métier — distincte de organization_members
-- qui gère le staff/les comptes applicatifs)
-- =========================================================

create table members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  member_number text not null,
  first_name text not null,
  last_name text not null,
  photo_url text,
  email text,
  phone text,
  birth_date date,
  address text,
  profession text,
  function text,
  status member_status not null default 'ACTIVE',
  join_date date not null default current_date,
  expiry_date date,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (organization_id, member_number)
);

create index idx_members_org on members(organization_id) where deleted_at is null;
create index idx_members_search on members(organization_id, last_name, first_name);

-- =========================================================
-- 3. TABLE card_templates
-- =========================================================
-- design_config est volontairement un JSONB flexible pour la Phase 2 :
-- un éditeur visuel complet viendra plus tard, mais la structure des
-- données ne change pas (cf. section 12 du cahier des charges).

create table card_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  design_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_card_templates_org on card_templates(organization_id);

-- =========================================================
-- 4. TABLE member_cards
-- =========================================================

create table member_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  template_id uuid references card_templates(id),
  status card_status not null default 'ACTIVE',
  verification_token text not null unique default replace(replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'), '=', ''),
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_member_cards_org on member_cards(organization_id);
create index idx_member_cards_member on member_cards(member_id);
create index idx_member_cards_token on member_cards(verification_token);

-- =========================================================
-- 5. RLS
-- =========================================================

alter table members enable row level security;
alter table card_templates enable row level security;
alter table member_cards enable row level security;

-- ---- members ----

create policy "members_select_org_or_superadmin"
on members for select
using (
  public.is_super_admin(auth.uid())
  or public.is_org_member(auth.uid(), organization_id)
);

create policy "members_insert_admin_or_superadmin"
on members for insert
with check (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

create policy "members_update_admin_or_superadmin"
on members for update
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

create policy "members_delete_admin_or_superadmin"
on members for delete
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

-- ---- card_templates ----

create policy "card_templates_select_org_or_superadmin"
on card_templates for select
using (
  public.is_super_admin(auth.uid())
  or public.is_org_member(auth.uid(), organization_id)
);

create policy "card_templates_write_admin_or_superadmin"
on card_templates for all
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
)
with check (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

-- ---- member_cards ----
-- IMPORTANT : aucune policy publique ici. La vérification publique passe
-- exclusivement par la fonction get_card_public_info() ci-dessous, qui
-- ne renvoie que les champs strictement nécessaires (jamais l'accès
-- direct à la table, qui contiendrait le lien vers le membre complet).

create policy "member_cards_select_org_or_superadmin"
on member_cards for select
using (
  public.is_super_admin(auth.uid())
  or public.is_org_member(auth.uid(), organization_id)
);

create policy "member_cards_write_admin_or_superadmin"
on member_cards for all
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
)
with check (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

-- =========================================================
-- 6. Génération atomique du numéro de membre
-- =========================================================
-- Exemple de sortie : ADS-2026-000125
-- Le verrou (for update) empêche deux créations simultanées de
-- produire le même numéro.

create function public.generate_member_number(p_organization_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_seq integer;
  v_year text := to_char(current_date, 'YYYY');
begin
  select upper(slug), member_sequence + 1
  into v_slug, v_seq
  from organizations
  where id = p_organization_id
  for update;

  if v_slug is null then
    raise exception 'Organisation introuvable';
  end if;

  update organizations
  set member_sequence = v_seq
  where id = p_organization_id;

  return v_slug || '-' || v_year || '-' || lpad(v_seq::text, 6, '0');
end;
$$;

-- =========================================================
-- 7. Création sécurisée d'un membre (numéro généré côté serveur)
-- =========================================================

create function public.create_member(
  p_organization_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text default null,
  p_phone text default null,
  p_function text default null
)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member members;
  v_number text;
begin
  if not (public.is_super_admin(auth.uid()) or public.is_org_admin(auth.uid(), p_organization_id)) then
    raise exception 'Permission refusée';
  end if;

  v_number := public.generate_member_number(p_organization_id);

  insert into members (
    organization_id, member_number, first_name, last_name,
    email, phone, function, created_by
  ) values (
    p_organization_id, v_number, p_first_name, p_last_name,
    p_email, p_phone, p_function, auth.uid()
  )
  returning * into v_member;

  return v_member;
end;
$$;

-- =========================================================
-- 8. Génération d'une carte pour un membre
-- =========================================================

create function public.issue_member_card(
  p_member_id uuid,
  p_template_id uuid default null,
  p_expires_at timestamptz default (now() + interval '1 year')
)
returns member_cards
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_card member_cards;
begin
  select organization_id into v_org_id from members where id = p_member_id and deleted_at is null;

  if v_org_id is null then
    raise exception 'Membre introuvable';
  end if;

  if not (public.is_super_admin(auth.uid()) or public.is_org_admin(auth.uid(), v_org_id)) then
    raise exception 'Permission refusée';
  end if;

  insert into member_cards (organization_id, member_id, template_id, expires_at)
  values (v_org_id, p_member_id, p_template_id, p_expires_at)
  returning * into v_card;

  return v_card;
end;
$$;

-- =========================================================
-- 9. Révocation d'une carte
-- =========================================================

create function public.revoke_member_card(p_card_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from member_cards where id = p_card_id;

  if v_org_id is null then
    raise exception 'Carte introuvable';
  end if;

  if not (public.is_super_admin(auth.uid()) or public.is_org_admin(auth.uid(), v_org_id)) then
    raise exception 'Permission refusée';
  end if;

  update member_cards
  set status = 'REVOKED', revoked_at = now(), revoked_reason = p_reason
  where id = p_card_id;
end;
$$;

-- =========================================================
-- 10. VÉRIFICATION PUBLIQUE — fonction sécurisée, sans policy publique
-- =========================================================
-- Renvoie uniquement : nom, organisation, numéro, statut, expiration.
-- N'expose jamais : téléphone, email, adresse, date de naissance, etc.
-- Marque automatiquement le statut EXPIRED si la date est dépassée,
-- sans jamais modifier les données (calcul à la volée).

create type card_verification_result as (
  found boolean,
  status text,
  member_name text,
  organization_name text,
  member_number text,
  issued_at timestamptz,
  expires_at timestamptz
);

create function public.get_card_public_info(p_token text)
returns card_verification_result
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result card_verification_result;
  v_row record;
begin
  select
    mc.status,
    mc.issued_at,
    mc.expires_at,
    m.first_name || ' ' || m.last_name as member_name,
    m.member_number,
    o.name as organization_name
  into v_row
  from member_cards mc
  join members m on m.id = mc.member_id
  join organizations o on o.id = mc.organization_id
  where mc.verification_token = p_token;

  if not found then
    v_result.found := false;
    v_result.status := 'NOT_FOUND';
    return v_result;
  end if;

  v_result.found := true;
  v_result.member_name := v_row.member_name;
  v_result.organization_name := v_row.organization_name;
  v_result.member_number := v_row.member_number;
  v_result.issued_at := v_row.issued_at;
  v_result.expires_at := v_row.expires_at;

  if v_row.status = 'REVOKED' then
    v_result.status := 'REVOKED';
  elsif v_row.expires_at is not null and v_row.expires_at < now() then
    v_result.status := 'EXPIRED';
  elsif v_row.status = 'SUSPENDED' then
    v_result.status := 'SUSPENDED';
  else
    v_result.status := 'ACTIVE';
  end if;

  return v_result;
end;
$$;

-- Autorise l'exécution de cette fonction à tout le monde, y compris les
-- visiteurs anonymes (rôle "anon") : c'est le SEUL point d'accès public
-- aux cartes, et il ne traverse aucune table directement.
grant execute on function public.get_card_public_info(text) to anon, authenticated;

-- =========================================================
-- 11. Triggers updated_at
-- =========================================================

create trigger trg_members_updated_at
  before update on members
  for each row execute procedure public.set_updated_at();

create trigger trg_card_templates_updated_at
  before update on card_templates
  for each row execute procedure public.set_updated_at();

create trigger trg_member_cards_updated_at
  before update on member_cards
  for each row execute procedure public.set_updated_at();
