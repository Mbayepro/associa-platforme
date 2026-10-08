'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { CertificateVisual } from '@/components/certificate-visual';
import dynamic from 'next/dynamic';

const CertificateVisualDynamic = dynamic(
  () => import('@/components/certificate-visual').then(m => ({ default: m.CertificateVisual })),
  { ssr: false }
);

const CertificatePreviewDynamic = dynamic(
  () => import('@/components/certificate-preview').then(m => ({ default: m.CertificatePreview })),
  { ssr: false }
);

export function RegistrationTable({
  registrations,
  certificates,
  sourceId,
  sourceType,
  title,
  orgId,
  orgName,
  orgLogo
}: {
  registrations: any[];
  certificates: any[];
  sourceId: string;
  sourceType: 'TRAINING' | 'EVENT';
  title: string;
  orgId: string;
  orgName?: string;
  orgLogo?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const attendedWithoutCert = registrations.filter(
    (r) =>
      r.status === 'ATTENDED' &&
      !certificates.find((c) => c.member_id === r.members?.id && c.status === 'VALID')
  );

  const toggleSelect = (memberId: string) => {
    const next = new Set(selectedIds);
    if (next.has(memberId)) next.delete(memberId);
    else next.add(memberId);
    setSelectedIds(next);
  };

  const printRef = useRef<HTMLDivElement>(null);
  const [printCertIds, setPrintCertIds] = useState<string[]>([]);

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Attestations_Associa',
    fonts: [{ family: 'Inter', source: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' }],
    pageStyle: `@page { size: A4 landscape !important; margin: 0 !important; } html, body { margin: 0 !important; padding: 0 !important; font-family: 'Inter', sans-serif !important; }`,
  });

  const handlePrint = (ids: string[]) => {
    setPrintCertIds(ids);
    setTimeout(() => {
      reactToPrintFn();
    }, 100);
  };

  const handleGenerate = async () => {
    if (selectedIds.size === 0) return;
    setIsGenerating(true);

    const { error } = await supabase.rpc('issue_certificates_bulk', {
      p_organization_id: orgId,
      p_member_ids: Array.from(selectedIds),
      p_type: sourceType,
      p_title: `Attestation de participation - ${title}`,
      p_training_id: sourceType === 'TRAINING' ? sourceId : null,
      p_event_id: sourceType === 'EVENT' ? sourceId : null,
    });

    setIsGenerating(false);

    if (!error) {
      setSelectedIds(new Set());
      router.refresh();
    } else {
      alert('Erreur lors de la génération des attestations.');
      console.error(error);
    }
  };

  const handleRevoke = async (certId: string) => {
    setIsRevoking(certId);
    const { error } = await supabase.rpc('revoke_certificate', { p_certificate_id: certId });
    setIsRevoking(null);
    if (!error) {
      router.refresh();
    } else {
      alert('Erreur lors de la révocation.');
      console.error(error);
    }
  };

  // Selection of existing valid certs for printing
  const validCerts = certificates.filter(c => c.status === 'VALID');
  const [selectedPrintIds, setSelectedPrintIds] = useState<Set<string>>(new Set());

  const togglePrintSelect = (certId: string) => {
    const next = new Set(selectedPrintIds);
    if (next.has(certId)) next.delete(certId);
    else next.add(certId);
    setSelectedPrintIds(next);
  };

  const printCertsData = validCerts.filter(c => printCertIds.includes(c.id));

  return (
    <div className="space-y-6">
      
      {/* Print Selection Bar */}
      {selectedPrintIds.size > 0 && (
        <div className="flex items-center gap-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selectedPrintIds.size} attestation(s) sélectionnée(s)</span>
          <button 
            onClick={() => handlePrint(Array.from(selectedPrintIds))}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 text-xs font-medium rounded shadow-sm border border-neutral-200 hover:bg-neutral-50"
          >
            <Printer className="w-4 h-4" /> Télécharger la sélection
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Membre</th>
              <th className="px-4 py-3 font-medium">Statut d'inscription</th>
              <th className="px-4 py-3 font-medium">Attestation</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => {
              const memberId = r.members?.id;
              const cert = certificates.find((c) => c.member_id === memberId && c.status === 'VALID');
              const isAttended = r.status === 'ATTENDED';
              const canGenerate = isAttended && !cert;

              return (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    {canGenerate && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(memberId)}
                        onChange={() => toggleSelect(memberId)}
                        className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                        title="Sélectionner pour générer l'attestation"
                      />
                    )}
                    {cert && (
                      <input
                        type="checkbox"
                        checked={selectedPrintIds.has(cert.id)}
                        onChange={() => togglePrintSelect(cert.id)}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-600"
                        title="Sélectionner pour télécharger"
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.members?.first_name} {r.members?.last_name}
                    <span className="ml-1 text-xs text-neutral-500">
                      ({r.members?.member_number})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {cert ? (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handlePrint([cert.id])}
                          className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Télécharger
                        </button>
                        <a 
                          href={`/verify/certificate/${cert.verification_token}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-brand-primary hover:underline text-xs"
                        >
                          Lien
                        </a>
                        <button
                          onClick={() => handleRevoke(cert.id)}
                          disabled={isRevoking === cert.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
                        >
                          {isRevoking === cert.id ? '...' : 'Révoquer'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {attendedWithoutCert.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm text-neutral-600">
            {selectedIds.size} membre(s) sélectionné(s) sur {attendedWithoutCert.length} éligible(s).
          </p>
          <button
            onClick={handleGenerate}
            disabled={selectedIds.size === 0 || isGenerating}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? 'Génération...' : 'Générer les attestations pour la sélection'}
          </button>
        </div>
      )}
      
      {certificates.filter(c => c.status === 'REVOKED').length > 0 && (
        <div className="pt-4">
          <h3 className="text-sm font-medium mb-3">Attestations révoquées</h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            {certificates.filter(c => c.status === 'REVOKED').map(c => {
               const reg = registrations.find(r => r.members?.id === c.member_id);
               return (
                 <li key={c.id}>
                   Réf: {c.verification_token} ({reg?.members?.first_name} {reg?.members?.last_name})
                 </li>
               );
            })}
          </ul>
        </div>
      )}

      {/* Hidden Print Container */}
      <div className="hidden">
        <div ref={printRef}>
          <style type="text/css" media="print">
            {`
              @page {
                size: A4 landscape;
                margin: 0;
              }
              .cert-print-page {
                page-break-after: always;
                width: 297mm;
                height: 210mm;
                overflow: hidden;
              }
            `}
          </style>
          
          {printCertsData.map((c: any) => {
            const reg = registrations.find((r: any) => r.members?.id === c.member_id);
            const memberName = reg ? `${reg.members.first_name} ${reg.members.last_name}` : 'Participant';
            const memberNumber = reg ? reg.members.member_number : '';
            return (
              <div key={c.id} className="cert-print-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CertificatePreviewDynamic>
                  <CertificateVisualDynamic 
                    participantName={memberName}
                    memberNumber={memberNumber}
                    sessionType={sourceType}
                    sessionTitle={title}
                    issuedAt={c.issued_at}
                    verificationToken={c.verification_token}
                    orgName={orgName || 'Organisation'}
                    orgLogo={orgLogo}
                  />
                </CertificatePreviewDynamic>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
