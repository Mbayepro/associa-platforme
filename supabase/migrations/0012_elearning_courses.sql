-- Migration: E-learning / Courses Module

-- 1. COURSES
create type course_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

create table courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  status course_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. COURSE MODULES (Chapitres)
create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. COURSE LESSONS (Leçons / Vidéos)
create table course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. COURSE ENROLLMENTS (Inscriptions)
create type enrollment_status as enum ('ENROLLED', 'COMPLETED');

create table course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  status enrollment_status not null default 'ENROLLED',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(course_id, member_id)
);

-- 5. COURSE PROGRESS (Progression)
create table course_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references course_enrollments(id) on delete cascade,
  lesson_id uuid not null references course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(enrollment_id, lesson_id)
);

-- Indexes
create index idx_courses_org on courses(organization_id);
create index idx_modules_course on course_modules(course_id);
create index idx_lessons_module on course_lessons(module_id);
create index idx_enrollments_course on course_enrollments(course_id);
create index idx_enrollments_member on course_enrollments(member_id);
create index idx_progress_enrollment on course_progress(enrollment_id);

-- RLS
alter table courses enable row level security;
alter table course_modules enable row level security;
alter table course_lessons enable row level security;
alter table course_enrollments enable row level security;
alter table course_progress enable row level security;

-- Policies
create policy "Users can view their organization courses"
  on courses for select
  using (organization_id in (select organization_id from organization_members where user_id = auth.uid()));

create policy "Admins can manage courses"
  on courses for all
  using (organization_id in (select organization_id from organization_members where user_id = auth.uid() and role = 'ADMIN'));

create policy "Users can view course modules"
  on course_modules for select
  using (course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid())));

create policy "Admins can manage course modules"
  on course_modules for all
  using (course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid() and role = 'ADMIN')));

create policy "Users can view course lessons"
  on course_lessons for select
  using (module_id in (select id from course_modules where course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid()))));

create policy "Admins can manage course lessons"
  on course_lessons for all
  using (module_id in (select id from course_modules where course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid() and role = 'ADMIN'))));

create policy "Users can view their organization enrollments"
  on course_enrollments for select
  using (course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid())));

create policy "Admins can manage enrollments"
  on course_enrollments for all
  using (course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid() and role = 'ADMIN')));

create policy "Users can view their organization progress"
  on course_progress for select
  using (enrollment_id in (select id from course_enrollments where course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid()))));

create policy "Admins can manage progress"
  on course_progress for all
  using (enrollment_id in (select id from course_enrollments where course_id in (select id from courses where organization_id in (select organization_id from organization_members where user_id = auth.uid() and role = 'ADMIN'))));

-- Updated At Triggers
create trigger set_updated_at_courses
  before update on courses
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_course_modules
  before update on course_modules
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_course_lessons
  before update on course_lessons
  for each row execute function public.handle_updated_at();
