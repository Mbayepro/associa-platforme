'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
type NewsStatus = any;

export function NewNewsForm({ organizationId, userId }: { organizationId: string, userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState<NewsStatus>('DRAFT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from title
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(
      newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: dbError } = await supabase
      .from('posts')
      .insert({
        organization_id: organizationId,
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        cover_image_url: coverImageUrl || null,
        status,
        published_at: status === 'PUBLISHED' ? new Date().toISOString() : null,
        author_id: userId,
      });

    setLoading(false);

    if (dbError) {
      setError("Une erreur est survenue lors de la création de l'article. Le slug doit être unique.");
      return;
    }

    router.push(`/dashboard/posts`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre de l'article</label>
        <input
          required
          value={title}
          onChange={handleTitleChange}
          placeholder="Ex : Notre nouvelle campagne..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Lien (Slug)</label>
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-500 bg-neutral-50 focus-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Statut</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as NewsStatus)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié (Visible publiquement)</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Extrait</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Un court résumé de l'article..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          rows={2}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Image de couverture (URL)</label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Contenu</label>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Le contenu de l'article (Markdown supporté)..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring font-mono"
          rows={10}
        />
        <p className="mt-1 text-xs text-neutral-500">Vous pouvez utiliser la syntaxe Markdown pour formater votre texte.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title || !slug || !content}
        className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Enregistrement...' : status === 'PUBLISHED' ? 'Publier l\'article' : 'Enregistrer le brouillon'}
      </button>
    </form>
  );
}
