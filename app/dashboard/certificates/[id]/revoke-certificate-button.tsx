'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function RevokeCertificateButton({ certificateId }: { certificateId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRevoke() {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cette attestation ? Cette action est irréversible.')) return;
    
    setLoading(true);
    await supabase.from('certificates').update({ is_revoked: true }).eq('id', certificateId);
    setLoading(false);
    
    router.refresh();
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={loading}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
    >
      {loading ? 'Révocation...' : 'Révoquer l\'attestation'}
    </button>
  );
}
