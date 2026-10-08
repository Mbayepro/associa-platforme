-- =========================================================
-- ASSOCIA — Migration 0005 : Phase 4
-- Attestations, Impact, Partenaires, Actualités
-- =========================================================

-- =========================================================
-- 1. ENUMS
-- =========================================================

create type certificate_type as enum ('MEMBERSHIP', 'TRAINING', 'EVENT', 'OTHER');
create type certificate_status as enum ('VALID', 'REVOKED');
create type news_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type partner_type as enum ('SPONSOR', 'INSTITUTIONAL', 'MEDIA', 'OTHER');
create type action_type as enum ('ENVIRONNEMENT', 'SOCIAL', 'JEUNESSE', 'FORMATION', 'AUTRE');

-- =========================================================
-- 2. TABLE certificates (Attestations)
-- =========================================================

create table certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  training_id uuid references trainings(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  type certificate_type not null default 'OTHER',
  title text not null,
  description text,
  issued_at date not null default current_date,
  verification_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  status certificate_status not null default 'VALID',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_certificates_org on certificates(organization_id);
create index idx_certificates_member on certificates(member_id);
create index idx_certificates_token on certificates(verification_token);

-- =========================================================
-- 3. TABLE actions & impact_metrics (Impact)
-- =========================================================

create table actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  type action_type not null default 'AUTRE',
  description text,
  date date,
  location text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_actions_org on actions(organization_id);

create table impact_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  action_id uuid references actions(id) on delete set null,
  title text not null,
  value numeric not null,
  unit text,
  icon text default 'activity',
  description text,
  display_order integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_impact_org on impact_metrics(organization_id);

-- =========================================================
-- 4. TABLE partners (Partenaires)
-- =========================================================

create table partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  logo_url text,
  description text,
  website_url text,
  contact text,
  partnership_type partner_type not null default 'OTHER',
  partnership_date date,
  is_active boolean not null default true,
  display_order integer default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_partners_org on partners(organization_id);

-- =========================================================
-- 5. TABLE posts (Actualités)
-- =========================================================

create table posts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  content text,
  cover_image_url text,
  status news_status not null default 'DRAFT',
  published_at timestamptz,
  author_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create index idx_posts_org on posts(organization_id);

-- =========================================================
-- 6. RLS Policies
-- =========================================================

alter table certificates enable row level security;
alter table actions enable row level security;
alter table impact_metrics enable row level security;
alter table partners enable row level security;
alter table posts enable row level security;

-- Certificates
create policy "Users can view their organization certificates"
  on certificates for select
  using (public.is_org_member(auth.uid(), organization_id));
-- IMPORTANT: Pas de policy d'insert/update pour certificates, on passe par les SECURITY DEFINER

-- Actions
create policy "Public can view actions"
  on actions for select
  using (true);

create policy "Admins can insert actions"
  on actions for insert
  with check (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can update actions"
  on actions for update
  using (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can delete actions"
  on actions for delete
  using (public.is_org_admin(auth.uid(), organization_id));

-- Impact Metrics
create policy "Public can view impact metrics"
  on impact_metrics for select
  using (true);

create policy "Admins can insert impact metrics"
  on impact_metrics for insert
  with check (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can update impact metrics"
  on impact_metrics for update
  using (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can delete impact metrics"
  on impact_metrics for delete
  using (public.is_org_admin(auth.uid(), organization_id));

-- Partners
create policy "Public can view active partners"
  on partners for select
  using (true);

create policy "Admins can insert partners"
  on partners for insert
  with check (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can update partners"
  on partners for update
  using (public.is_org_admin(auth.uid(), organization_id));

create policy "Admins can delete partners"
  on partners for delete
  using (public.is_org_admin(auth.uid(), organization_id));

-- Posts
create policy "Public can view published news"
  on posts for select
  using (status = 'PUBLISHED');

create policy "Users can view all news of their org"
  on posts for select
  using (public.is_org_member(auth.uid(), organization_id));

create policy "Admins can insert news"
  on posts for insert
  with check (public.is_org_admin(auth.uid(), organization_id) or public.org_role_of(auth.uid(), organization_id) = 'COMMUNICATION_MANAGER');

create policy "Admins can update news"
  on posts for update
  using (public.is_org_admin(auth.uid(), organization_id) or public.org_role_of(auth.uid(), organization_id) = 'COMMUNICATION_MANAGER');

create policy "Admins can delete news"
  on posts for delete
  using (public.is_org_admin(auth.uid(), organization_id));

-- =========================================================
-- 7. TRIGGERS (updated_at)
-- =========================================================

create trigger set_updated_at_certificates
  before update on certificates
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_actions
  before update on actions
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_impact
  before update on impact_metrics
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_partners
  before update on partners
  for each row execute procedure public.set_updated_at();

create trigger set_updated_at_news
  before update on posts
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- 8. SECURITY DEFINER FUNCTIONS (Certificates)
-- =========================================================

create or replace function public.issue_certificate(
  p_organization_id uuid,
  p_member_id uuid,
  p_type certificate_type,
  p_title text,
  p_description text default null,
  p_training_id uuid default null,
  p_event_id uuid default null,
  p_issued_at date default current_date
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cert_id uuid;
begin
  -- Verification rights
  if not (public.is_org_admin(auth.uid(), p_organization_id)) then
    raise exception 'Unauthorized to issue certificates for this organization';
  end if;

  insert into public.certificates (
    organization_id, member_id, type, title, description, training_id, event_id, issued_at, created_by
  ) values (
    p_organization_id, p_member_id, p_type, p_title, p_description, p_training_id, p_event_id, p_issued_at, auth.uid()
  ) returning id into v_cert_id;

  return v_cert_id;
end;
$$;

create or replace function public.revoke_certificate(
  p_certificate_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  select organization_id into v_org_id from public.certificates where id = p_certificate_id;

  if not found then
    raise exception 'Certificate not found';
  end if;

  if not (public.is_org_admin(auth.uid(), v_org_id)) then
    raise exception 'Unauthorized to revoke certificates for this organization';
  end if;

  update public.certificates set status = 'REVOKED', updated_at = now() where id = p_certificate_id;
end;
$$;

-- =========================================================
-- 9. PUBLIC VERIFICATION FUNCTION (Certificates)
-- =========================================================

create or replace function public.get_certificate_public_info(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cert record;
  v_org record;
  v_member record;
begin
  select * into v_cert from public.certificates where verification_token = p_token;
  if not found then
    return '{"status": "NOT_FOUND"}'::jsonb;
  end if;

  if v_cert.status = 'REVOKED' then
    return '{"status": "REVOKED"}'::jsonb;
  end if;

  select name, logo_url into v_org from public.organizations where id = v_cert.organization_id;
  select first_name, last_name, member_number into v_member from public.members where id = v_cert.member_id;

  return jsonb_build_object(
    'status', 'VALID',
    'certificate', jsonb_build_object(
      'type', v_cert.type,
      'title', v_cert.title,
      'issued_at', v_cert.issued_at,
      'training_id', v_cert.training_id,
      'event_id', v_cert.event_id,
      'verification_token', v_cert.verification_token
    ),
    'member', jsonb_build_object(
      'first_name', v_member.first_name,
      'last_name', v_member.last_name,
      'member_number', v_member.member_number
    ),
    'organization', jsonb_build_object(
      'name', v_org.name,
      'logo_url', v_org.logo_url
    )
  );
end;
$$;
