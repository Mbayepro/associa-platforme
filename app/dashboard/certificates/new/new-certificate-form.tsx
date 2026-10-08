'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
type CertificateType = any;
import { FileBadge, Loader2 } from 'lucide-react';

type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  member_number: string;
};

export function NewCertificateForm({ 
  organizationId, 
  members 
}: { 
  organizationId: string;
  members: Member[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [type, setType] = useState<CertificateType>('TRAINING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // On passe par la RPC SECURITY DEFINER car les RLS bloquent l'insert direct
    const { data: certId, error: dbError } = await (supabase.rpc as any)(
      'issue_certificate',
      {
        p_organization_id: organizationId,
        p_member_id: memberId,
        p_type: type,
        p_title: title,
        p_description: description || null,
        p_issued_at: issuedAt,
      }
    );

    setLoading(false);

    if (dbError) {
      setError("Une erreur est survenue : " + (dbError.message || "vérifiez vos droits."));
      return;
    }

    router.push(`/dashboard/certificates/${certId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Bénéficiaire (Membre)</label>
          <div className="relative">
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white"
            >
              {members.length === 0 && <option value="" disabled>Aucun membre disponible</option>}
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.member_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Type d'attestation</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CertificateType)}
              className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white"
            >
              <option value="TRAINING">Formation</option>
              <option value="EVENT">Événement</option>
              <option value="MEMBERSHIP">Membre</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Date d'émission</label>
            <input
              required
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Titre / Intitulé</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Attestation de participation au BootCamp 2026"
            className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-2.5 text-sm transition-all focus-ring hover:bg-white placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Description ou détail <span className="text-neutral-400 font-normal">(Optionnel)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires figurant sur l'attestation..."
            className="w-full rounded-xl border border-neutral-200/80 bg-white/50 px-4 py-3 text-sm transition-all focus-ring hover:bg-white placeholder:text-neutral-400 resize-none"
            rows={3}
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
          disabled={loading || !title || !memberId}
          className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white premium-shadow transition-all hover:bg-brand-primary/90 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileBadge className="h-4 w-4" />
          )}
          {loading ? 'Création en cours...' : 'Délivrer l\'attestation'}
        </button>
      </div>
    </form>
  );
}
