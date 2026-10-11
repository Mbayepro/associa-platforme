import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, BookOpen, Clock } from 'lucide-react';

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ organization_slug: string; id: string }>;
}) {
  const { organization_slug, id } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, color_primary, logo_url')
    .eq('slug', organization_slug)
    .maybeSingle();

  if (!org) notFound();

  const { data: course } = await supabase
    .from('courses')
    .select('*, course_modules(*, course_lessons(*))')
    .eq('id', id)
    .eq('organization_id', org.id)
    .eq('is_published', true)
    .maybeSingle();

  if (!course) notFound();

  const primaryColor = org.color_primary || '#16A34A';

  // Calculate some stats
  const totalModules = course.course_modules?.length || 0;
  const totalLessons = course.course_modules?.reduce((acc: number, mod: any) => acc + (mod.course_lessons?.length || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-brand-primary/20">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href={`/${organization_slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'association
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          {course.cover_url ? (
            <div className="w-full h-64 md:h-96 relative">
              <img src={course.cover_url} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">E-Learning</span>
                <h1 className="text-3xl md:text-5xl font-extrabold">{course.title}</h1>
              </div>
            </div>
          ) : (
            <div className="w-full bg-neutral-100 p-10 md:p-16 border-b border-neutral-200" style={{ backgroundColor: `${primaryColor}15` }}>
              <span className="inline-block px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider text-neutral-600">E-Learning</span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900">{course.title}</h1>
            </div>
          )}

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">À propos de ce cours</h2>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{course.description || "Aucune description fournie pour ce cours."}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-neutral-400" />
                  Programme du cours
                </h3>
                <div className="space-y-4">
                  {course.course_modules?.sort((a: any, b: any) => a.order - b.order).map((mod: any, index: number) => (
                    <div key={mod.id} className="border border-neutral-200 rounded-2xl overflow-hidden bg-neutral-50/50">
                      <div className="p-4 bg-white border-b border-neutral-200 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1 block">Module {index + 1}</span>
                          <h4 className="font-semibold text-neutral-900">{mod.title}</h4>
                        </div>
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                          {mod.course_lessons?.length || 0} leçons
                        </span>
                      </div>
                      {mod.course_lessons?.length > 0 && (
                        <ul className="divide-y divide-neutral-100">
                          {mod.course_lessons.sort((a: any, b: any) => a.order - b.order).map((lesson: any) => (
                            <li key={lesson.id} className="p-4 flex items-center gap-3 text-sm text-neutral-600">
                              <PlayCircle className="w-4 h-4 text-neutral-400 shrink-0" />
                              <span className="font-medium">{lesson.title}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {totalModules === 0 && (
                    <div className="text-center p-8 border border-dashed border-neutral-200 rounded-2xl text-neutral-500">
                      Le programme de ce cours n'a pas encore été publié.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <span className="block text-2xl font-bold text-neutral-900">{totalModules}</span>
                    <span className="text-xs font-medium text-neutral-500 uppercase">Modules</span>
                  </div>
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-neutral-100">
                    <span className="block text-2xl font-bold text-neutral-900">{totalLessons}</span>
                    <span className="text-xs font-medium text-neutral-500 uppercase">Leçons</span>
                  </div>
                </div>

                <Link
                  href={`/login`}
                  className="w-full flex justify-center items-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: primaryColor }}
                >
                  S'inscrire pour commencer
                </Link>
                <p className="text-xs text-center text-neutral-500 mt-4">
                  Vous devez être membre de l'association {org.name} pour suivre ce cours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
