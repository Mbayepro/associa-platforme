'use client';

import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ReceiptVisual } from './receipt-visual';

export function ReceiptActions({
  memberName,
  memberAddress,
  orgName,
  orgAddress,
  orgLogo,
  memberNumber,
}: {
  memberName: string;
  memberAddress?: string | null;
  orgName?: string;
  orgAddress?: string | null;
  orgLogo?: string | null;
  memberNumber: string;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  
  const [amount, setAmount] = useState<number>(10000);
  const [type, setType] = useState<'COTISATION' | 'DON'>('COTISATION');
  const [signatory, setSignatory] = useState<string>('Le Président');

  const reactToPrintFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Recu_${type}_${memberName.replace(/\s+/g, '_')}`,
    fonts: [{ family: 'Inter', source: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }],
    pageStyle: `@page { size: A4; margin: 0; } html, body { margin: 0; padding: 0; background: white; }`,
  });

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-900">Paiements & Reçus</h2>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col gap-4">
        <p className="text-sm font-medium text-neutral-900">Générer un reçu (PDF prêt à envoyer)</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Montant (FCFA)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-md border-neutral-300 shadow-sm sm:text-sm" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Type de paiement</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-md border-neutral-300 shadow-sm sm:text-sm"
            >
              <option value="COTISATION">Cotisation annuelle</option>
              <option value="DON">Don ponctuel</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">Nom du signataire</label>
            <input 
              type="text" 
              value={signatory}
              onChange={(e) => setSignatory(e.target.value)}
              placeholder="Ex: Le Trésorier, M. X"
              className="w-full rounded-md border-neutral-300 shadow-sm sm:text-sm" 
            />
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={() => reactToPrintFn()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 shadow-sm shrink-0"
          >
            Générer le PDF
          </button>
        </div>
      </div>

      <div className="hidden">
        <div ref={printRef} className="print-container">
          <ReceiptVisual
            memberName={memberName}
            memberAddress={memberAddress}
            amount={amount}
            type={type}
            signatory={signatory}
            orgName={orgName}
            orgAddress={orgAddress}
            orgLogo={orgLogo}
            date={new Date().toISOString()}
            receiptNumber={`REC-${new Date().getFullYear()}-${memberNumber.split('-').pop() || '001'}`}
          />
        </div>
      </div>
    </div>
  );
}
