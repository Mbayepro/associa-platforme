'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Printer, MoreVertical, CreditCard, RotateCcw } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { CardVisual } from '@/components/card-visual';
import dynamic from 'next/dynamic';

const CardVisualDynamic = dynamic(
  () => import('@/components/card-visual').then(m => ({ default: m.CardVisual })),
  { ssr: false }
);

export function CardsClient({
  initialCards,
  orgId,
  orgName,
  orgLogo,
  orgTagline,
  colorPrimary,
  colorSecondary,
  totalPages,
  currentPage,
  statusFilter,
  searchQuery,
  totalCount
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printMode, setPrintMode] = useState<'CR80' | 'A4'>('CR80');
  const printRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q') as string;
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q);
    else params.delete('q');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === initialCards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(initialCards.map((c: any) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const generateMissingCards = async () => {
    if (!confirm('Générer les cartes manquantes pour tous les membres actifs sans carte ?')) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/cards/generate-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération.');
      
      if (data.count === 0) {
        alert("Tous les membres actifs ont déjà une carte !");
      } else {
        alert(`${data.count} carte(s) générée(s) avec succès !`);
      }
      
      router.refresh();
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erreur lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Cartes_Associa',
    fonts: [{ family: 'Inter', source: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }],
    pageStyle: `@page { size: ${printMode === 'CR80' ? '85.6mm 54mm' : 'A4'}; margin: 0mm !important; } html, body { margin: 0 !important; padding: 0 !important; background: white; }`,
  });

  const handlePrint = (mode: 'CR80' | 'A4') => {
    setPrintMode(mode);
    setTimeout(() => {
      reactToPrintFn();
    }, 100);
  };

  const selectedCardsData = initialCards.filter((c: any) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              name="q"
              defaultValue={searchQuery}
              placeholder="Chercher (nom, prénom, N°)..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:border-brand-primary outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="EXPIRED">Expirées</option>
            <option value="SUSPENDED">Suspendues</option>
            <option value="REVOKED">Révoquées</option>
          </select>
        </form>

        <div className="flex gap-2 items-center">
          <button 
            onClick={generateMissingCards}
            disabled={isGenerating}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 disabled:opacity-50"
          >
            {isGenerating ? 'Génération...' : 'Générer les cartes manquantes'}
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-brand-primary/10 p-3 rounded-lg border border-brand-primary/20">
          <span className="text-sm font-medium text-brand-primary">{selectedIds.length} sélectionnée(s)</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handlePrint('CR80')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 text-xs font-medium rounded shadow-sm border border-neutral-200 hover:bg-neutral-50">
              <Printer className="w-4 h-4" /> Imprimer PVC (CR80)
            </button>
            <button onClick={() => handlePrint('A4')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 text-xs font-medium rounded shadow-sm border border-neutral-200 hover:bg-neutral-50">
              <Printer className="w-4 h-4" /> Imprimer Planche A4
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === initialCards.length}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Membre</th>
                <th className="px-4 py-3 font-medium">N° Membre</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Émission</th>
                <th className="px-4 py-3 font-medium">Expiration</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-12 h-12 text-neutral-300 mb-3" />
                      <p className="font-medium text-neutral-900">Aucune carte trouvée</p>
                      <p className="text-xs mt-1">Modifiez vos filtres ou générez des cartes manquantes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialCards.map((c: any) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50">
                    <td className="px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelect(c.id)}
                        className="rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {c.members.first_name} {c.members.last_name}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{c.members.member_number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                        c.status === 'EXPIRED' ? 'bg-amber-100 text-amber-700' :
                        c.status === 'SUSPENDED' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(c.issued_at).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {c.status === 'ACTIVE' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={async () => {
                              if (!confirm('Suspendre cette carte ?')) return;
                              await (supabase.rpc as any)('revoke_member_card', { p_card_id: c.id, p_reason: 'Suspendue' });
                              router.refresh();
                            }}
                            className="text-xs text-orange-600 hover:underline"
                          >
                            Suspendre
                          </button>
                          <button 
                            onClick={async () => {
                              if (!confirm('Révoquer cette carte ?')) return;
                              await (supabase.rpc as any)('revoke_member_card', { p_card_id: c.id, p_reason: 'Révoquée' });
                              router.refresh();
                            }}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Révoquer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3">
            <span className="text-xs text-neutral-500">Page {currentPage} sur {totalPages}</span>
            <div className="flex gap-1">
              <button 
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-2 py-1 text-xs border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Print Container */}
      <div className="hidden">
        <div ref={printRef} className={`print-container ${printMode === 'CR80' ? 'mode-cr80' : 'mode-a4'}`}>
          <style type="text/css" media="print">
            {`
              .mode-a4 {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10mm;
                padding: 10mm;
              }
              .card-wrapper {
                page-break-inside: avoid;
                margin-bottom: ${printMode === 'CR80' ? '0' : '5mm'};
              }
              .cr80-recto, .cr80-verso {
                width: 85.6mm;
                height: 54mm;
                page-break-after: always;
                overflow: hidden;
              }
              .mode-a4 .cr80-verso {
                page-break-after: auto;
              }
            `}
          </style>
          
          {selectedCardsData.map((c: any) => (
            <div key={c.id} className="card-wrapper">
              {/* RECTO */}
              <div className="cr80-recto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '--card-scale': '0.37795' } as any}>
                  <CardVisualDynamic 
                    memberName={`${c.members.first_name} ${c.members.last_name}`}
                    memberFunction={c.members.function}
                    memberNumber={c.members.member_number}
                    phone={c.members.phone}
                    photoUrl={c.members.photo_url}
                    orgName={orgName}
                    orgLogo={orgLogo}
                    orgTagline={orgTagline}
                    colorPrimary={colorPrimary}
                    colorSecondary={colorSecondary}
                    issuedAt={c.issued_at}
                    expiresAt={c.expires_at}
                    status={c.status}
                    verificationToken={c.verification_token}
                    isFlipped={false}
                    hideFlipButton={true}
                  />
              </div>
              {/* VERSO */}
              <div className="cr80-verso" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', '--card-scale': '0.37795' } as any}>
                <CardVisualDynamic 
                    memberName={`${c.members.first_name} ${c.members.last_name}`}
                    memberFunction={c.members.function}
                    memberNumber={c.members.member_number}
                    phone={c.members.phone}
                    photoUrl={c.members.photo_url}
                    orgName={orgName}
                    orgLogo={orgLogo}
                    orgTagline={orgTagline}
                    colorPrimary={colorPrimary}
                    colorSecondary={colorSecondary}
                    issuedAt={c.issued_at}
                    expiresAt={c.expires_at}
                    status={c.status}
                    verificationToken={c.verification_token}
                    isFlipped={true}
                    hideFlipButton={true}
                  />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
