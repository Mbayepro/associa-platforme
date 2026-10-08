'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function RegisterMemberToEventForm({
  eventId,
  availableMembers,
}: {
  eventId: string;
  availableMembers: { id: string; first_name: string; last_name: string }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setLoading(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc(
      'register_member_to_event',
      { p_event_id: eventId, p_member_id: memberId }
    );

    setLoading(false);

    if (rpcError) {
      setError("Impossible d'inscrire ce membre.");
      return;
    }

    setMemberId('');
    router.refresh();
  }

  if (availableMembers.length === 0) {
    return (
      <p className="text-xs text-neutral-500">
        Tous les membres existants sont déjà inscrits.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <select
        value={memberId}
        onChange={(e) => setMemberId(e.target.value)}
        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
      >
        <option value="">Sélectionner un membre…</option>
        {availableMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.first_name} {m.last_name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={!memberId || loading}
        className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        Inscrire
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
