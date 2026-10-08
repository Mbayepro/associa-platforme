'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function NewImpactForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: dbError } = await (supabase.from('impact_metrics') as any)
      .insert({
        organization_id: organizationId,
        title,
        value: parseFloat(value),
        unit: unit || null,
        description: description || null,
      });

    setLoading(false);

    if (dbError) {
      setError("Une erreur est survenue lors de la création de la métrique.");
      return;
    }

    router.push(`/dashboard/impact`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Bénéficiaires accompagnés"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Valeur</label>
          <input
            required
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex : 1500"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Unité (Optionnel)</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ex : personnes, kg, €..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description (Optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title || !value}
        className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Création...' : 'Ajouter la métrique'}
      </button>
    </form>
  );
}
