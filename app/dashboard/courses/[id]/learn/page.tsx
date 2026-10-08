import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CoursePlayer } from './course-player';

export default async function LearnCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/dashboard/courses/${params.id}`);
  }

  // Fetch course and its modules/lessons/progress
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id, title,
      course_modules (
        id, title, "order",
        course_lessons (
          id, title, type, content, video_url, document_url, "order",
          course_quiz_questions (
            id, question, "order",
            course_quiz_options (
              id, option_text, is_correct, "order"
            )
          )
        )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !course) notFound();

  // Fetch progress
  const { data: progress } = await supabase
    .from('course_progress')
    .select('lesson_id, completed_at')
    .eq('enrollment_id', enrollment.id);

  const completedLessonIds = (progress || []).map(p => p.lesson_id);

  // Sort data properly
  const modules = (course.course_modules || []).sort((a, b) => a.order - b.order).map(mod => ({
    ...mod,
    course_lessons: (mod.course_lessons || []).sort((a, b) => a.order - b.order).map(lesson => ({
      ...lesson,
      course_quiz_questions: (lesson.course_quiz_questions || []).sort((a, b) => a.order - b.order).map(q => ({
        ...q,
        course_quiz_options: (q.course_quiz_options || []).sort((a, b) => a.order - b.order)
      }))
    }))
  }));

  return (
    <CoursePlayer 
      course={course} 
      modules={modules} 
      completedLessonIds={completedLessonIds} 
      enrollmentId={enrollment.id} 
    />
  );
}
