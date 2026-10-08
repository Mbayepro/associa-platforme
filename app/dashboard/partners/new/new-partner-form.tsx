'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
type PartnerType = any;
import { Handshake, Loader2 } from 'lucide-react';

export function NewPartnerForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [partnershipType, setPartnershipType] = useState<PartnerType>('SPONSOR');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: dbError } = await supabase
      .from('partners')
      .insert({
        organization_id: organizationId,
        name,
        logo_url: logoUrl || null,
        website_url: websiteUrl || null,
        partnership_type: partnershipType,
      });

    setLoading(false);

    if (dbError) {
      setError("Une erreur est survenue lors de la création du partenaire.");
      return;
    }

    router.push(`/dashboard/partners`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Nom du partenaire</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Fondation XYZ"
              className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white placeholder:text-neutral-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Type de partenariat</label>
            <select
              value={partnershipType}
              onChange={(e) => setPartnershipType(e.target.value as PartnerType)}
              className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white"
            >
              <option value="SPONSOR">Sponsor financier</option>
              <option value="INSTITUTIONAL">Partenaire institutionnel</option>
              <option value="MEDIA">Partenaire média</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">URL du logo <span className="text-neutral-400 font-normal">(Optionnel)</span></label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Site web <span className="text-neutral-400 font-normal">(Optionnel)</span></label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white placeholder:text-neutral-400"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-neutral-100">
        <button
          type="submit"
          disabled={loading || !name}
          className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white premium-shadow transition-all hover:bg-brand-primary/90 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Handshake className="h-4 w-4" />
          )}
          {loading ? 'Création en cours...' : 'Ajouter le partenaire'}
        </button>
      </div>
    </form>
  );
}
