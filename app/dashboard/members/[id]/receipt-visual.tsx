import React from 'react';

export function ReceiptVisual({
  memberName,
  memberAddress,
  amount,
  type,
  signatory,
  orgName,
  orgAddress,
  orgLogo,
  date,
  receiptNumber,
}: {
  memberName: string;
  memberAddress?: string | null;
  amount: number;
  type: 'COTISATION' | 'DON';
  signatory: string;
  orgName?: string;
  orgAddress?: string | null;
  orgLogo?: string | null;
  date: string;
  receiptNumber: string;
}) {
  const typeLabel = type === 'COTISATION' ? 'Cotisation membre' : 'Don';
  const typeText = type === 'COTISATION' ? 'au titre de sa cotisation' : 'à titre de don';

  return (
    <div className="p-10 max-w-[800px] w-[210mm] min-h-[297mm] mx-auto bg-white text-black font-sans text-sm border-2 border-transparent">
      <div className="flex justify-between items-start mb-12">
        <div className="space-y-2 max-w-[50%]">
          {orgLogo && (
            <img src={orgLogo} alt={orgName} className="h-16 object-contain mb-4" />
          )}
          <h1 className="text-xl font-bold uppercase">{orgName || "Association"}</h1>
          {orgAddress ? (
            <p className="whitespace-pre-wrap text-gray-700">{orgAddress}</p>
          ) : (
            <p className="text-gray-700">Adresse non renseignée</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">REÇU DE {type === 'COTISATION' ? 'COTISATION' : 'DON'}</h2>
          <p className="text-gray-500 font-medium">N° {receiptNumber}</p>
          <p className="text-gray-500 mt-1">Date: {new Date(date).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 mb-8 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 border-b pb-2">Bénéficiaire des versements</h3>
        <p className="mb-2"><strong>Nom de l'association :</strong> {orgName || "Association"}</p>
        <p className="mb-2"><strong>Objet :</strong> {typeLabel}</p>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 border-b pb-2">{type === 'COTISATION' ? 'Membre' : 'Donateur'}</h3>
        <p className="mb-2"><strong>Nom et Prénom :</strong> {memberName}</p>
        <p><strong>Adresse :</strong> {memberAddress || "____________________________________________"}</p>
      </div>

      <div className="border-l-4 border-brand-primary pl-4 py-2 mb-12">
        <p className="text-base mb-2">
          L'association reconnaît avoir reçu, {typeText}, la somme de :
        </p>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {amount.toLocaleString('fr-FR')} FCFA
        </p>
        <p className="text-sm text-gray-600 italic">
          (Somme en toutes lettres : ____________________________________________)
        </p>
      </div>

      <div className="text-sm text-gray-700 mb-16 space-y-4">
        <p>Date du paiement : <span className="font-semibold">{new Date(date).toLocaleDateString('fr-FR')}</span></p>
      </div>

      <div className="flex justify-end">
        <div className="text-center w-64">
          <p className="mb-12 font-medium">{signatory || "Le Président / Le Trésorier"}</p>
          <div className="border-b border-gray-300 w-full mb-2"></div>
          <p className="text-xs text-gray-500">(Signature et cachet)</p>
        </div>
      </div>
    </div>
  );
}
