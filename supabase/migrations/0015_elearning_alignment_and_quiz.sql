-- ==============================================================================
-- MIGRATION: 0015_elearning_alignment_and_quiz.sql (PRÉPARÉE)
-- DESCRIPTION: Sécurise les tables Quiz, garantit les colonnes is_published/thumbnail_url
--              et configure les policies et le bucket storage 'courses'.
-- ==============================================================================

-- 1. Colonnes de 'courses' et 'course_lessons'
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url text;

DO $$ BEGIN
  CREATE TYPE lesson_type AS ENUM ('VIDEO', 'DOCUMENT', 'TEXT', 'QUIZ');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS type lesson_type DEFAULT 'VIDEO';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS is_required boolean DEFAULT false;

-- 2. Tables pour les Quiz
CREATE TABLE IF NOT EXISTS course_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_quiz_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES course_quiz_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_quiz_questions_lesson ON course_quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON course_quiz_options(question_id);

-- Activer RLS
ALTER TABLE course_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_quiz_options ENABLE ROW LEVEL SECURITY;

-- Policies Quiz Questions
DROP POLICY IF EXISTS "Users can view quiz questions" ON course_quiz_questions;
CREATE POLICY "Users can view quiz questions"
  ON course_quiz_questions FOR SELECT
  USING (
    lesson_id IN (
      SELECT cl.id FROM course_lessons cl
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE c.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON course_quiz_questions;
CREATE POLICY "Admins can manage quiz questions"
  ON course_quiz_questions FOR ALL
  USING (
    lesson_id IN (
      SELECT cl.id FROM course_lessons cl
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE c.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
      )
    )
  );

-- Policies Quiz Options
DROP POLICY IF EXISTS "Users can view quiz options" ON course_quiz_options;
CREATE POLICY "Users can view quiz options"
  ON course_quiz_options FOR SELECT
  USING (
    question_id IN (
      SELECT qq.id FROM course_quiz_questions qq
      JOIN course_lessons cl ON cl.id = qq.lesson_id
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE c.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins can manage quiz options" ON course_quiz_options;
CREATE POLICY "Admins can manage quiz options"
  ON course_quiz_options FOR ALL
  USING (
    question_id IN (
      SELECT qq.id FROM course_quiz_questions qq
      JOIN course_lessons cl ON cl.id = qq.lesson_id
      JOIN course_modules cm ON cm.id = cl.module_id
      JOIN courses c ON c.id = cm.course_id
      WHERE c.organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
      )
    )
  );

-- 3. Bucket Storage 'courses'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'courses',
  'courses',
  true,
  10485760, -- 10MB
  '{image/jpeg,image/png,image/webp,application/pdf}'
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = '{image/jpeg,image/png,image/webp,application/pdf}';

-- Policies Storage pour 'courses'
DROP POLICY IF EXISTS "Public read for course assets" ON storage.objects;
CREATE POLICY "Public read for course assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

DROP POLICY IF EXISTS "Admins can upload course assets" ON storage.objects;
CREATE POLICY "Admins can upload course assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'courses'
    AND auth.uid() IN (
      SELECT user_id FROM public.organization_members
      WHERE role IN ('OWNER', 'ADMIN') AND status = 'ACTIVE'
    )
  );
