-- =========================================================
-- ASSOCIA — Migration 0004 : Formations, Événements, Présences
-- =========================================================

create type training_type as enum ('GRATUIT', 'PAYANT', 'MEMBERS_ONLY', 'PUBLIC');
create type session_status as enum ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
create type registration_status as enum ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'ABSENT');
create type event_type as enum ('ENVIRONNEMENT', 'SOCIAL', 'JEUNESSE', 'FORMATION', 'AUTRE');
create type attendance_session_type as enum ('FORMATION', 'EVENT');

-- =========================================================
-- 1. TABLE trainings (formations)
-- =========================================================

create table trainings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  trainer text,
  session_date date not null,
  session_time time,
  location text,
  capacity integer,
  price numeric(10,2) default 0,
  type training_type not null default 'GRATUIT',
  status session_status not null default 'DRAFT',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_trainings_org on trainings(organization_id);

-- =========================================================
-- 2. TABLE formation_registrations
-- =========================================================

create table formation_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  training_id uuid not null references trainings(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  status registration_status not null default 'REGISTERED',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (training_id, member_id)
);

create index idx_formation_registrations_training on formation_registrations(training_id);

-- =========================================================
-- 3. TABLE events
-- =========================================================

create table events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  event_type event_type not null default 'AUTRE',
  event_date date not null,
  event_time time,
  location text,
  capacity integer,
  organizer text,
  status session_status not null default 'DRAFT',
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_events_org on events(organization_id);

-- =========================================================
-- 4. TABLE event_registrations
-- =========================================================

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  status registration_status not null default 'REGISTERED',
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create index idx_event_registrations_event on event_registrations(event_id);

-- =========================================================
-- 5. TABLE attendance (présence par scan QR — formations ET événements)
-- =========================================================

create table attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  session_type attendance_session_type not null,
  session_id uuid not null,
  member_id uuid not null references members(id) on delete cascade,
  scanned_by uuid references profiles(id),
  scanned_at timestamptz not null default now(),
  unique (session_type, session_id, member_id)
);

create index idx_attendance_session on attendance(session_type, session_id);

-- =========================================================
-- 6. Rôles autorisés à gérer formations / événements
-- =========================================================

create function public.can_manage_trainings(uid uuid, org_id uuid)
returns boolean as $$
  select public.is_org_admin(uid, org_id)
    or exists (
      select 1 from organization_members
      where user_id = uid and organization_id = org_id
        and status = 'ACTIVE' and role = 'TRAINING_MANAGER'
    );
$$ language sql stable security definer set search_path = public;

create function public.can_manage_events(uid uuid, org_id uuid)
returns boolean as $$
  select public.is_org_admin(uid, org_id)
    or exists (
      select 1 from organization_members
      where user_id = uid and organization_id = org_id
        and status = 'ACTIVE' and role = 'EVENT_MANAGER'
    );
$$ language sql stable security definer set search_path = public;

create function public.can_scan(uid uuid, org_id uuid)
returns boolean as $$
  select public.is_org_admin(uid, org_id)
    or exists (
      select 1 from organization_members
      where user_id = uid and organization_id = org_id
        and status = 'ACTIVE'
        and role in ('SCANNER', 'TRAINING_MANAGER', 'EVENT_MANAGER')
    );
$$ language sql stable security definer set search_path = public;

-- =========================================================
-- 7. RLS
-- =========================================================

alter table trainings enable row level security;
alter table formation_registrations enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table attendance enable row level security;

-- ---- trainings ----
create policy "trainings_select_org"
on trainings for select
using (public.is_super_admin(auth.uid()) or public.is_org_member(auth.uid(), organization_id));

create policy "trainings_write_managers"
on trainings for all
using (public.is_super_admin(auth.uid()) or public.can_manage_trainings(auth.uid(), organization_id))
with check (public.is_super_admin(auth.uid()) or public.can_manage_trainings(auth.uid(), organization_id));

-- ---- formation_registrations ----
create policy "formation_registrations_select_org"
on formation_registrations for select
using (public.is_super_admin(auth.uid()) or public.is_org_member(auth.uid(), organization_id));

create policy "formation_registrations_write_managers"
on formation_registrations for all
using (public.is_super_admin(auth.uid()) or public.can_manage_trainings(auth.uid(), organization_id))
with check (public.is_super_admin(auth.uid()) or public.can_manage_trainings(auth.uid(), organization_id));

-- ---- events ----
create policy "events_select_org"
on events for select
using (public.is_super_admin(auth.uid()) or public.is_org_member(auth.uid(), organization_id));

create policy "events_write_managers"
on events for all
using (public.is_super_admin(auth.uid()) or public.can_manage_events(auth.uid(), organization_id))
with check (public.is_super_admin(auth.uid()) or public.can_manage_events(auth.uid(), organization_id));

-- ---- event_registrations ----
create policy "event_registrations_select_org"
on event_registrations for select
using (public.is_super_admin(auth.uid()) or public.is_org_member(auth.uid(), organization_id));

create policy "event_registrations_write_managers"
on event_registrations for all
using (public.is_super_admin(auth.uid()) or public.can_manage_events(auth.uid(), organization_id))
with check (public.is_super_admin(auth.uid()) or public.can_manage_events(auth.uid(), organization_id));

-- ---- attendance ----
-- Lecture : membres de l'organisation. Écriture : uniquement via la
-- fonction record_attendance ci-dessous (jamais d'insertion directe
-- depuis le client, pour garantir la cohérence organisation/membre/session).
create policy "attendance_select_org"
on attendance for select
using (public.is_super_admin(auth.uid()) or public.is_org_member(auth.uid(), organization_id));

-- =========================================================
-- 8. Enregistrement de présence par scan (fonction sécurisée)
-- =========================================================
-- p_token : le verification_token de la CARTE MEMBRE scannée (celui déjà
-- utilisé pour /verify/card/{token}) — on réutilise ainsi une seule
-- source de vérité pour identifier un membre par QR, comme prévu par
-- le cahier des charges (section 18).

create type attendance_scan_result as (
  success boolean,
  message text,
  member_name text,
  member_number text
);

create function public.record_attendance(
  p_token text,
  p_session_type attendance_session_type,
  p_session_id uuid
)
returns attendance_scan_result
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result attendance_scan_result;
  v_member_id uuid;
  v_org_id uuid;
  v_card_status card_status;
  v_session_org_id uuid;
  v_member_name text;
  v_member_number text;
begin
  select mc.member_id, mc.organization_id, mc.status, m.first_name || ' ' || m.last_name, m.member_number
  into v_member_id, v_org_id, v_card_status, v_member_name, v_member_number
  from member_cards mc
  join members m on m.id = mc.member_id
  where mc.verification_token = p_token;

  if v_member_id is null then
    v_result.success := false;
    v_result.message := 'Carte introuvable';
    return v_result;
  end if;

  if not (public.is_super_admin(auth.uid()) or public.can_scan(auth.uid(), v_org_id)) then
    v_result.success := false;
    v_result.message := 'Permission refusée';
    return v_result;
  end if;

  if v_card_status <> 'ACTIVE' then
    v_result.success := false;
    v_result.message := 'Carte non active (' || v_card_status || ')';
    return v_result;
  end if;

  if p_session_type = 'FORMATION' then
    select organization_id into v_session_org_id from trainings where id = p_session_id;
  else
    select organization_id into v_session_org_id from events where id = p_session_id;
  end if;

  if v_session_org_id is null or v_session_org_id <> v_org_id then
    v_result.success := false;
    v_result.message := 'Ce membre n''appartient pas à l''organisation de cette session';
    return v_result;
  end if;

  begin
    insert into attendance (organization_id, session_type, session_id, member_id, scanned_by)
    values (v_org_id, p_session_type, p_session_id, v_member_id, auth.uid());
  exception when unique_violation then
    v_result.success := false;
    v_result.message := 'Présence déjà enregistrée pour ce membre';
    v_result.member_name := v_member_name;
    v_result.member_number := v_member_number;
    return v_result;
  end;

  -- Met à jour l'inscription correspondante si elle existe
  if p_session_type = 'FORMATION' then
    update formation_registrations set status = 'ATTENDED'
    where training_id = p_session_id and member_id = v_member_id;
  else
    update event_registrations set status = 'ATTENDED'
    where event_id = p_session_id and member_id = v_member_id;
  end if;

  v_result.success := true;
  v_result.message := 'Présence enregistrée';
  v_result.member_name := v_member_name;
  v_result.member_number := v_member_number;
  return v_result;
end;
$$;

-- =========================================================
-- 9. Inscription d'un membre à une formation / un événement
-- =========================================================

create function public.register_member_to_training(p_training_id uuid, p_member_id uuid)
returns formation_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_row formation_registrations;
begin
  select organization_id into v_org_id from trainings where id = p_training_id;
  if v_org_id is null then
    raise exception 'Formation introuvable';
  end if;
  if not (public.is_super_admin(auth.uid()) or public.can_manage_trainings(auth.uid(), v_org_id)) then
    raise exception 'Permission refusée';
  end if;

  insert into formation_registrations (organization_id, training_id, member_id)
  values (v_org_id, p_training_id, p_member_id)
  returning * into v_row;

  return v_row;
end;
$$;

create function public.register_member_to_event(p_event_id uuid, p_member_id uuid)
returns event_registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_row event_registrations;
begin
  select organization_id into v_org_id from events where id = p_event_id;
  if v_org_id is null then
    raise exception 'Événement introuvable';
  end if;
  if not (public.is_super_admin(auth.uid()) or public.can_manage_events(auth.uid(), v_org_id)) then
    raise exception 'Permission refusée';
  end if;

  insert into event_registrations (organization_id, event_id, member_id)
  values (v_org_id, p_event_id, p_member_id)
  returning * into v_row;

  return v_row;
end;
$$;

-- =========================================================
-- 10. Triggers updated_at
-- =========================================================

create trigger trg_trainings_updated_at before update on trainings
  for each row execute procedure public.set_updated_at();
create trigger trg_formation_registrations_updated_at before update on formation_registrations
  for each row execute procedure public.set_updated_at();
create trigger trg_events_updated_at before update on events
  for each row execute procedure public.set_updated_at();
create trigger trg_event_registrations_updated_at before update on event_registrations
  for each row execute procedure public.set_updated_at();
