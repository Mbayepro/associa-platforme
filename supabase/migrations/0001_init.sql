-- =========================================================
-- ASSOCIA — Migration 0001 : Fondations multi-tenant
-- Organizations, Profiles, Membership, Roles, RLS
-- =========================================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. ENUMS
-- =========================================================

create type org_role as enum (
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'TRAINING_MANAGER',
  'EVENT_MANAGER',
  'COMMUNICATION_MANAGER',
  'SCANNER',
  'MEMBER'
);

create type org_status as enum ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

create type plan_type as enum ('FREE', 'STARTER', 'PRO', 'BUSINESS');

-- =========================================================
-- 2. TABLE organizations
-- =========================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  logo_url text,
  email text,
  phone text,
  address text,
  country text,
  city text,
  website text,
  color_primary text default '#16A34A',   -- vert par défaut
  color_secondary text default '#1D4ED8', -- bleu par défaut
  tagline text,
  social_links jsonb default '{}'::jsonb,
  plan plan_type not null default 'FREE',
  status org_status not null default 'ACTIVE',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on organizations(slug);

-- =========================================================
-- 3. TABLE profiles (miroir de auth.users)
-- =========================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  is_platform_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Création automatique du profil à l'inscription
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 4. TABLE organization_members (appartenance + rôle)
-- =========================================================

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role org_role not null default 'MEMBER',
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'REMOVED')),
  invited_by uuid references profiles(id),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index idx_org_members_org on organization_members(organization_id);
create index idx_org_members_user on organization_members(user_id);

-- =========================================================
-- 5. FONCTIONS HELPER (utilisées par les policies RLS)
-- =========================================================

-- Un utilisateur est-il super admin de la plateforme ?
create function public.is_super_admin(uid uuid)
returns boolean as $$
  select coalesce(
    (select is_platform_super_admin from profiles where id = uid),
    false
  );
$$ language sql stable security definer set search_path = public;

-- Un utilisateur appartient-il à une organisation ?
create function public.is_org_member(uid uuid, org_id uuid)
returns boolean as $$
  select exists (
    select 1 from organization_members
    where user_id = uid
      and organization_id = org_id
      and status = 'ACTIVE'
  );
$$ language sql stable security definer set search_path = public;

-- Quel est le rôle d'un utilisateur dans une organisation ?
create function public.org_role_of(uid uuid, org_id uuid)
returns org_role as $$
  select role from organization_members
  where user_id = uid
    and organization_id = org_id
    and status = 'ACTIVE'
  limit 1;
$$ language sql stable security definer set search_path = public;

-- L'utilisateur a-t-il un rôle d'administration dans l'organisation ?
-- (OWNER ou ADMIN, utilisé pour les actions de gestion)
create function public.is_org_admin(uid uuid, org_id uuid)
returns boolean as $$
  select exists (
    select 1 from organization_members
    where user_id = uid
      and organization_id = org_id
      and status = 'ACTIVE'
      and role in ('OWNER', 'ADMIN')
  );
$$ language sql stable security definer set search_path = public;

-- =========================================================
-- 6. ROW LEVEL SECURITY
-- =========================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;

-- ---- organizations ----

-- Un membre voit son organisation ; un super admin voit tout
create policy "org_select_member_or_superadmin"
on organizations for select
using (
  public.is_super_admin(auth.uid())
  or public.is_org_member(auth.uid(), id)
);

-- N'importe quel utilisateur connecté peut créer une organisation
-- (il en devient OWNER via un trigger juste après, cf. section 7)
create policy "org_insert_authenticated"
on organizations for insert
with check (auth.uid() is not null);

-- Seuls OWNER/ADMIN de l'organisation (ou super admin) peuvent la modifier
create policy "org_update_admin_or_superadmin"
on organizations for update
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), id)
);

-- Seul le super admin peut supprimer une organisation
create policy "org_delete_superadmin_only"
on organizations for delete
using (public.is_super_admin(auth.uid()));

-- ---- profiles ----

-- Un utilisateur voit son propre profil ; les membres d'une même org
-- voient les profils des autres membres de cette org ; super admin voit tout
create policy "profiles_select_self_or_org_or_superadmin"
on profiles for select
using (
  id = auth.uid()
  or public.is_super_admin(auth.uid())
  or exists (
    select 1 from organization_members om1
    join organization_members om2 on om1.organization_id = om2.organization_id
    where om1.user_id = auth.uid()
      and om2.user_id = profiles.id
      and om1.status = 'ACTIVE'
      and om2.status = 'ACTIVE'
  )
);

create policy "profiles_update_self"
on profiles for update
using (id = auth.uid());

-- ---- organization_members ----

-- Un membre voit la liste des membres de SES organisations uniquement
create policy "org_members_select_same_org_or_superadmin"
on organization_members for select
using (
  public.is_super_admin(auth.uid())
  or public.is_org_member(auth.uid(), organization_id)
);

-- Seuls OWNER/ADMIN peuvent ajouter des membres à leur organisation
create policy "org_members_insert_admin_or_self_owner"
on organization_members for insert
with check (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
  -- cas particulier : création du premier membre (OWNER) juste après
  -- la création de l'organisation, géré par la fonction sécurisée ci-dessous
  or (user_id = auth.uid() and role = 'OWNER'
      and not exists (
        select 1 from organization_members
        where organization_id = organization_members.organization_id
      ))
);

create policy "org_members_update_admin_or_superadmin"
on organization_members for update
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

create policy "org_members_delete_admin_or_superadmin"
on organization_members for delete
using (
  public.is_super_admin(auth.uid())
  or public.is_org_admin(auth.uid(), organization_id)
);

-- =========================================================
-- 7. FONCTION SÉCURISÉE : création d'organisation + OWNER
-- =========================================================
-- Regroupe la création de l'organisation ET l'ajout de l'utilisateur
-- courant comme OWNER dans une seule transaction atomique, pour éviter
-- tout état intermédiaire où l'organisation existerait sans propriétaire.

create function public.create_organization_with_owner(
  p_name text,
  p_slug text,
  p_country text default null,
  p_city text default null,
  p_email text default null,
  p_phone text default null
)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org organizations;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié';
  end if;

  insert into organizations (name, slug, country, city, email, phone)
  values (p_name, p_slug, p_country, p_city, p_email, p_phone)
  returning * into v_org;

  insert into organization_members (organization_id, user_id, role, status)
  values (v_org.id, auth.uid(), 'OWNER', 'ACTIVE');

  return v_org;
end;
$$;

-- =========================================================
-- 8. TRIGGERS updated_at génériques
-- =========================================================

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute procedure public.set_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_org_members_updated_at
  before update on organization_members
  for each row execute procedure public.set_updated_at();
