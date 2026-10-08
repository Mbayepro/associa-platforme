'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { useReactToPrint } from 'react-to-print';

const CardVisual = dynamic(
  () => import('@/components/card-visual').then(m => ({ default: m.CardVisual })),
  { ssr: false, loading: () => <div className="w-full max-w-[400px] mx-auto bg-neutral-100 animate-pulse rounded-[24px] border border-neutral-200" style={{ aspectRatio: '856/540' }} /> }
);

interface CardRow {
  id: string;
  status: string;
  verification_token: string;
  issued_at: string;
  expires_at: string | null;
}

export function CardActions({
  memberId,
  memberName,
  memberFunction,
  memberNumber,
  phone,
  photoUrl,
  orgId,
  orgName,
  orgLogo,
  orgTagline,
  colorPrimary,
  colorSecondary,
  existingCards,
}: {
  memberId: string;
  memberName: string;
  memberFunction: string | null;
  memberNumber: string;
  phone: string | null;
  photoUrl?: string | null;
  orgId?: string;
  orgName?: string;
  orgLogo?: string | null;
  orgTagline?: string | null;
  colorPrimary: string;
  colorSecondary: string;
  existingCards: CardRow[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Carte_${memberName.replace(/\s+/g, '_')}`,
    fonts: [{ family: 'Inter', source: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }],
    pageStyle: `@page { size: 85.6mm 54mm; margin: 0mm !important; } html, body { margin: 0 !important; padding: 0 !important; background: white; }`,
  });

  const activeCard = existingCards.find((c) => c.status === 'ACTIVE');
  const displayCard = activeCard || existingCards[0];

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const { error: rpcError } = await (supabase.rpc as any)('issue_member_card', {
      p_member_id: memberId,
      p_template_id: null,
      p_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    setLoading(false);
    if (rpcError) {
      console.error("RPC Error:", JSON.stringify(rpcError, null, 2));
      setError(`Erreur: ${rpcError.message || JSON.stringify(rpcError)}`);
      return;
    }
    router.refresh();
  }

  async function handleRevoke(cardId: string) {
    if (!confirm('Révoquer cette carte ?')) return;
    setLoading(true);
    setError(null);
    const { error: rpcError } = await (supabase.rpc as any)('revoke_member_card', {
      p_card_id: cardId,
      p_reason: 'Révoquée manuellement',
    });
    setLoading(false);
    if (rpcError) {
      setError('Impossible de révoquer la carte.');
      return;
    }
    router.refresh();
  }

  async function handlePhotoUpload(file: File) {
    if (!orgId) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${memberId}-${Date.now()}.${fileExt}`;
      const filePath = `${orgId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('members')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('members')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('members')
        .update({ photo_url: publicUrl })
        .eq('id', memberId);

      if (updateError) throw updateError;
      
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert('Erreur upload photo');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-900">Carte membre</h2>
        {!activeCard && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Génération…' : '+ Générer une carte'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {displayCard ? (
        <div className="space-y-4 relative">
          {displayCard.status !== 'ACTIVE' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
              Carte {displayCard.status}
            </div>
          )}
          <CardVisual
            memberName={memberName}
            memberFunction={memberFunction}
            memberNumber={memberNumber}
            phone={phone}
            photoUrl={photoUrl}
            orgName={orgName}
            orgLogo={orgLogo}
            orgTagline={orgTagline}
            colorPrimary={colorPrimary}
            colorSecondary={colorSecondary}
            issuedAt={displayCard.issued_at}
            expiresAt={displayCard.expires_at}
            status={displayCard.status}
            verificationToken={displayCard.verification_token}
            onPhotoUpload={handlePhotoUpload}
          />
          {displayCard.status === 'ACTIVE' && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => reactToPrintFn()}
                className="text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded px-3 py-1.5 shadow-sm hover:bg-neutral-50"
              >
                Imprimer (PDF)
              </button>
              <button
                onClick={() => handleRevoke(displayCard.id)}
                disabled={loading}
                className="text-xs font-medium text-red-600 hover:underline shrink-0"
              >
                Révoquer la carte
              </button>
            </div>
          )}

          <div className="hidden">
            <div ref={printRef} className="print-container">
              <style type="text/css" media="print">
                {`
                  .cr80-recto, .cr80-verso {
                    width: 85.6mm;
                    height: 54mm;
                    page-break-after: always;
                    overflow: hidden;
                    background: white;
                  }
                `}
              </style>
              <div className="cr80-recto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '--card-scale': '0.37795' } as any}>
                  <CardVisual
                    memberName={memberName}
                    memberFunction={memberFunction}
                    memberNumber={memberNumber}
                    phone={phone}
                    photoUrl={photoUrl}
                    orgName={orgName}
                    orgLogo={orgLogo}
                    orgTagline={orgTagline}
                    colorPrimary={colorPrimary}
                    colorSecondary={colorSecondary}
                    issuedAt={displayCard.issued_at}
                    expiresAt={displayCard.expires_at}
                    status={displayCard.status}
                    verificationToken={displayCard.verification_token}
                    isFlipped={false}
                    hideFlipButton={true}
                  />
              </div>
              <div className="cr80-verso" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '--card-scale': '0.37795' } as any}>
                  <CardVisual
                    memberName={memberName}
                    memberFunction={memberFunction}
                    memberNumber={memberNumber}
                    phone={phone}
                    photoUrl={photoUrl}
                    orgName={orgName}
                    orgLogo={orgLogo}
                    orgTagline={orgTagline}
                    colorPrimary={colorPrimary}
                    colorSecondary={colorSecondary}
                    issuedAt={displayCard.issued_at}
                    expiresAt={displayCard.expires_at}
                    status={displayCard.status}
                    verificationToken={displayCard.verification_token}
                    isFlipped={true}
                    hideFlipButton={true}
                  />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50 text-center space-y-3">
          <p className="text-sm text-neutral-500">Ce membre ne possède aucune carte.</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 shadow-sm"
          >
            {loading ? 'Génération…' : 'Générer une carte'}
          </button>
        </div>
      )}

      {existingCards.filter((c) => c.status !== 'ACTIVE').length > 0 && (
        <div className="space-y-2 mt-6">
          <p className="text-xs font-medium text-neutral-500">
            Historique des cartes
          </p>
          {existingCards
            .filter((c) => c.status !== 'ACTIVE')
            .map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-xs text-neutral-600 bg-neutral-50"
              >
                <span>{c.status}</span>
                <span>{new Date(c.issued_at).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
