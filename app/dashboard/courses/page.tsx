import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Plus, MoreVertical, Edit, Eye, Trash } from 'lucide-react';

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description, is_published, created_at, thumbnail_url, course_modules(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-primary" />
            E-Learning (Formations en ligne)
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Gérez vos modules de formation en ligne, vos chapitres et vos quiz.
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-all focus:ring-2 focus:ring-brand-primary/20"
        >
          <Plus className="h-4 w-4" />
          Nouveau cours
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 mb-4">
            <BookOpen className="h-6 w-6 text-brand-primary" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-1">
            Aucun cours pour le moment
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm mb-6">
            Commencez à créer votre première formation en ligne pour la partager avec vos membres.
          </p>
          <Link
            href="/dashboard/courses/new"
            className="flex items-center gap-2 rounded-lg bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <Plus className="h-4 w-4" />
            Créer mon premier cours
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-brand-primary/30 transition-all hover:shadow-md"
            >
              <div className="aspect-video w-full bg-neutral-100 dark:bg-neutral-800 relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                <div className="absolute top-2 flex justify-between w-full px-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-md shadow-sm ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {course.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1 flex-1">
                    {course.title}
                  </h3>
                </div>
                
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 flex-1">
                  {course.description || 'Aucune description'}
                </p>

                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                  <div className="flex items-center gap-1">
                    <span>{course.course_modules?.length || 0} module(s)</span>
                  </div>
                  <span>{new Date(course.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="flex items-center justify-center gap-2 py-3 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Voir
                </Link>
                <Link
                  href={`/dashboard/courses/${course.id}/edit`}
                  className="flex items-center justify-center gap-2 py-3 border-l border-neutral-100 dark:border-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Modifier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
