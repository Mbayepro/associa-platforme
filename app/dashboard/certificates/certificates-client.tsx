'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Printer, CheckSquare, Square, FileBadge, Search } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CertificateVisual } from '@/components/certificate-visual';

export function CertificatesClient({
  initialCertificates,
  orgName,
  orgLogo,
  colorPrimary
}: {
  initialCertificates: any[];
  orgName: string;
  orgLogo?: string | null;
  colorPrimary?: string;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  const TYPE_LABELS: Record<string, string> = {
    TRAINING: 'Formation',
    FORMATION: 'Formation',
    EVENT: 'Événement',
    MEMBERSHIP: 'Adhésion',
    FELICITATION: 'Félicitation',
    OTHER: 'Autre'
  };

  const filtered = initialCertificates.filter((c: any) => {
    const memberName = `${c.member?.first_name || ''} ${c.member?.last_name || ''}`.toLowerCase();
    const title = (c.title || '').toLowerCase();
    const memberNum = (c.member?.member_number || '').toLowerCase();
    const q = search.toLowerCase();
    return memberName.includes(q) || title.includes(q) || memberNum.includes(q);
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((c: any) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Attestations_Associa',
    pageStyle: `@page { size: A4 landscape; margin: 0mm !important; } html, body { margin: 0 !important; padding: 0 !important; background: white; }`,
  });

  const handlePrintSelected = () => {
    if (selectedIds.length === 0) return;
    setTimeout(() => {
      reactToPrintFn();
    }, 100);
  };

  const selectedCertificates = initialCertificates.filter((c: any) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (bénéficiaire, titre)..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-xl">
            <span className="text-sm font-semibold text-brand-primary">
              {selectedIds.length} sélectionnée(s)
            </span>
            <button
              onClick={handlePrintSelected}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-800 text-xs font-semibold rounded-lg shadow-sm border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <Printer className="w-4 h-4 text-brand-primary" />
              Imprimer la sélection ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                />
              </th>
              <th className="px-4 py-3 font-medium">Titre / Type</th>
              <th className="px-4 py-3 font-medium">Bénéficiaire</th>
              <th className="px-4 py-3 font-medium">Date d'émission</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileBadge className="w-10 h-10 text-neutral-300 mb-2" />
                    <p className="font-medium text-neutral-800">Aucune attestation trouvée</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((cert: any) => {
                const member: any = Array.isArray(cert.member) ? cert.member[0] : cert.member;
                const isChecked = selectedIds.includes(cert.id);
                return (
                  <tr key={cert.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(cert.id)}
                        className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{cert.title}</p>
                      <p className="text-xs text-neutral-500">{TYPE_LABELS[cert.type?.toUpperCase()] || cert.type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">
                        {member?.first_name} {member?.last_name}
                      </p>
                      <p className="text-xs text-neutral-500">{member?.member_number}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {cert.status === 'REVOKED' ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Révoquée</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Valide</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/certificates/${cert.id}`}
                        className="text-sm font-semibold text-brand-primary hover:underline"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden Print Container for Multiple Certificates */}
      <div className="hidden">
        <div ref={printRef}>
          <style type="text/css" media="print">
            {`
              @page {
                size: A4 landscape;
                margin: 0mm !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              .cert-print-sheet {
                width: 297mm;
                height: 210mm;
                page-break-after: always;
                page-break-inside: avoid;
                break-inside: avoid;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
              .cert-print-sheet:last-child {
                page-break-after: auto;
              }
            `}
          </style>
          {selectedCertificates.map((cert: any) => {
            const member: any = Array.isArray(cert.member) ? cert.member[0] : cert.member;
            return (
              <div key={cert.id} className="cert-print-sheet">
                <CertificateVisual
                  participantName={`${member?.first_name || ''} ${member?.last_name || ''}`}
                  memberNumber={member?.member_number || ''}
                  sessionType={cert.type}
                  sessionTitle={cert.title}
                  issuedAt={cert.issued_at}
                  verificationToken={cert.verification_token}
                  orgName={orgName}
                  orgLogo={orgLogo}
                  colorPrimary={colorPrimary}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
