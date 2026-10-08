import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, ArrowLeft, Settings } from 'lucide-react';
import { CourseContent } from './course-content';

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify membership and role
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/onboarding');
  const isAdmin = membership.role === 'ADMIN';

  // Fetch course and its modules/lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id, title, description, is_published, thumbnail_url,
      course_modules (
        id, title, description, "order",
        course_lessons (
          id, title, type, video_url, document_url, "order", is_required
        )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !course) {
    notFound();
  }

  // Sort modules
  const modules = (course.course_modules || []).sort((a, b) => a.order - b.order).map(mod => ({
    ...mod,
    course_lessons: (mod.course_lessons || []).sort((a, b) => a.order - b.order)
  }));

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('course_id', course.id)
    .eq('user_id', user.id)
    .maybeSingle();

  const isEnrolled = !!enrollment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/courses"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white line-clamp-1">
              {course.title}
            </h1>
            {isAdmin && (
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md shadow-sm ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {course.is_published ? 'Publié' : 'Brouillon'}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
            {course.description || 'Aucune description fournie.'}
          </p>
        </div>
        {isAdmin && (
          <Link
            href={`/dashboard/courses/${course.id}/edit`}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 transition-all"
          >
            <Settings className="h-4 w-4" />
            Paramètres
          </Link>
        )}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Modules & Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <CourseContent 
            courseId={course.id} 
            modules={modules} 
            isAdmin={isAdmin} 
          />
        </div>

        {/* Right Column: Preview/Stats */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-4">Aperçu</h3>
            {course.thumbnail_url ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-neutral-100">
                <img src={course.thumbnail_url} alt="Cover" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-neutral-50 text-neutral-400 border border-dashed border-neutral-200">
                <BookOpen className="h-8 w-8" />
                <span className="text-xs">Aucune image</span>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Modules</span>
                <span className="font-medium text-neutral-900">{modules.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Leçons</span>
                <span className="font-medium text-neutral-900">
                  {modules.reduce((acc, mod) => acc + (mod.course_lessons?.length || 0), 0)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {isEnrolled ? (
                <Link
                  href={`/dashboard/courses/${course.id}/learn`}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                >
                  Continuer le cours
                </Link>
              ) : (
                <form action={async () => {
                  'use server';
                  const supabase = await createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    await supabase.from('course_enrollments').insert({
                      course_id: course.id,
                      user_id: user.id
                    });
                  }
                  redirect(`/dashboard/courses/${course.id}/learn`);
                }}>
                  <button className="flex w-full items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm">
                    S'inscrire à ce cours
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
