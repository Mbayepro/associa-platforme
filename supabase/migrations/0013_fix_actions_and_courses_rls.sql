-- 0013_fix_actions_and_courses_rls.sql
-- Fix RLS policies to allow members to create actions and public to view published courses and trainings.

-- 1. Actions : Allow any active member of the organization to create an action
DROP POLICY IF EXISTS "Admins can insert actions" ON actions;
DROP POLICY IF EXISTS "Members can insert actions" ON actions;
CREATE POLICY "Members can insert actions"
  ON actions FOR INSERT
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- 2. Courses : Allow public to view PUBLISHED courses (using is_published = true)
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
CREATE POLICY "Public can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Public can view published course modules" ON course_modules;
CREATE POLICY "Public can view published course modules"
  ON course_modules FOR SELECT
  USING (course_id IN (SELECT id FROM courses WHERE is_published = true));

DROP POLICY IF EXISTS "Public can view published course lessons" ON course_lessons;
CREATE POLICY "Public can view published course lessons"
  ON course_lessons FOR SELECT
  USING (module_id IN (SELECT id FROM course_modules WHERE course_id IN (SELECT id FROM courses WHERE is_published = true)));
