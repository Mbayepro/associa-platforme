'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function NewMemberForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fn, setFn] = useState('Membre');
  const [customFn, setCustomFn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const finalFn = fn === 'Autre' ? customFn : fn;

    const { data, error: rpcError } = await supabase.rpc('create_member', {
      p_organization_id: organizationId,
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email || null,
      p_phone: phone || null,
      p_function: finalFn || null,
    });

    setLoading(false);

    if (rpcError) {
      setError("Une erreur est survenue lors de la création du membre.");
      return;
    }

    router.push(`/dashboard/members/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Prénom</label>
          <input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Fonction</label>
        <select
          value={fn}
          onChange={(e) => setFn(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring mb-2 bg-white"
        >
          <option value="Membre">Membre</option>
          <option value="Président">Président</option>
          <option value="Coordonnateur">Coordonnateur</option>
          <option value="Secrétaire général">Secrétaire général</option>
          <option value="Trésorier">Trésorier</option>
          <option value="Autre">Autre</option>
        </select>
        {fn === 'Autre' && (
          <input
            value={customFn}
            onChange={(e) => setCustomFn(e.target.value)}
            placeholder="Précisez la fonction..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
            required
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Téléphone</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !firstName || !lastName}
        className="rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Création…' : 'Créer le membre'}
      </button>
    </form>
  );
}
