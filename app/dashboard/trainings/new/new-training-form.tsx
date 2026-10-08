'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function NewTrainingForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [trainer, setTrainer] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('GRATUIT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: insertError } = await supabase
      .from('trainings')
      .insert({
        organization_id: organizationId,
        title,
        description: description || null,
        trainer: trainer || null,
        session_date: date,
        location: location || null,
        type,
        status: 'PUBLISHED',
      })
      .select('id')
      .single();

    setLoading(false);

    if (insertError) {
      setError('Une erreur est survenue lors de la création.');
      return;
    }

    router.push(`/dashboard/trainings/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Formateur</label>
          <input
            value={trainer}
            onChange={(e) => setTrainer(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Lieu</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          >
            <option value="GRATUIT">Gratuit</option>
            <option value="PAYANT">Payant</option>
            <option value="MEMBERS_ONLY">Membres uniquement</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title || !date}
        className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Création…' : 'Créer la formation'}
      </button>
    </form>
  );
}
