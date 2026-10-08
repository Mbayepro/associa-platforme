import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Image as ImageIcon } from 'lucide-react';

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Actualités</h1>
          <p className="text-sm text-neutral-600">
            {articles?.length ?? 0} article{(articles?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Rédiger un article
        </Link>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Vous n&apos;avez encore aucune actualité.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Rédiger un article
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <div key={article.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm flex flex-col">
              {article.cover_image_url ? (
                <img src={article.cover_image_url} alt={article.title} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-neutral-100 text-neutral-400">
                  <ImageIcon className="h-8 w-8 opacity-50" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                    article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                    article.status === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {article.status === 'PUBLISHED' ? 'Publié' : article.status === 'DRAFT' ? 'Brouillon' : 'Archivé'}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 line-clamp-2">{article.title}</h3>
                {article.excerpt && (
                  <p className="mt-1 text-sm text-neutral-600 line-clamp-2 flex-1">{article.excerpt}</p>
                )}
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/posts/${article.id}`} className="text-sm font-medium text-brand-primary">
                    Éditer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
