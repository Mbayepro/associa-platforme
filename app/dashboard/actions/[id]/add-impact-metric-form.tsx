'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AddImpactMetricForm({ actionId, organizationId }: { actionId: string, organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const valueStr = formData.get('value') as string;
    const unit = formData.get('unit') as string;

    const value = parseFloat(valueStr);

    const { error } = await (supabase.from('impact_metrics') as any)
      .insert({
        organization_id: organizationId,
        action_id: actionId,
        title,
        value,
        unit: unit || null,
      });

    setLoading(false);
    if (!error) {
      setIsOpen(false);
      router.refresh();
    } else {
      alert(error.message);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm hover:bg-neutral-50"
      >
        + Ajouter une métrique
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-neutral-700">Titre *</label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Ex: Arbres plantés"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="value" className="block text-xs font-medium text-neutral-700">Valeur numérique *</label>
          <input
            type="number"
            step="any"
            name="value"
            id="value"
            placeholder="Ex: 1500"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-xs font-medium text-neutral-700">Unité (Optionnel)</label>
          <input
            type="text"
            name="unit"
            id="unit"
            placeholder="Ex: arbres"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-primary px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
