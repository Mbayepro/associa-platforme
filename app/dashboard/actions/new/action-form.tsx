'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ActionForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;

    const { data, error: submitError } = await (supabase.from('actions') as any)
      .insert({
        organization_id: organizationId,
        title,
        type,
        description: description || null,
        date: date || null,
        location: location || null,
      })
      .select()
      .single();

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/actions/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-neutral-700">
          Titre de l'action *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-neutral-700">
          Type *
        </label>
        <select
          name="type"
          id="type"
          required
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
        >
          <option value="ENVIRONNEMENT">Environnement</option>
          <option value="SOCIAL">Social</option>
          <option value="JEUNESSE">Jeunesse</option>
          <option value="FORMATION">Formation</option>
          <option value="AUTRE">Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-neutral-700">
          Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-neutral-700">
          Lieu
        </label>
        <input
          type="text"
          name="location"
          id="location"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Création...' : 'Créer l\'action'}
        </button>
      </div>
    </form>
  );
}
