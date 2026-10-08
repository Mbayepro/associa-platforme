'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AIGenerateButton } from '@/components/ai-generate-button';

export function NewEventForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('AUTRE');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        organization_id: organizationId,
        title,
        description: description || null,
        organizer: organizer || null,
        event_date: date,
        location: location || null,
        event_type: eventType,
        status: 'PUBLISHED',
      })
      .select('id')
      .single();

    setLoading(false);

    if (insertError) {
      setError('Une erreur est survenue lors de la création.');
      return;
    }

    router.push(`/dashboard/events/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Journée de reboisement"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium">Description</label>
          <AIGenerateButton 
            promptSource={title} 
            contextType="event_description" 
            onGenerate={setDescription} 
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Organisateur</label>
          <input
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
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
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          >
            <option value="ENVIRONNEMENT">Environnement</option>
            <option value="SOCIAL">Social</option>
            <option value="JEUNESSE">Jeunesse</option>
            <option value="FORMATION">Formation</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !title || !date}
        className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Création…' : 'Créer l\u2019événement'}
      </button>
    </form>
  );
}
