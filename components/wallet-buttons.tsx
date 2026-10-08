'use client';

import { useState } from 'react';
import { Apple, Smartphone } from 'lucide-react';

export function WalletButtons({ token }: { token: string }) {
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);

  const handleWalletAdd = async (type: 'apple' | 'google') => {
    setLoading(type);
    
    // Simulation of API call
    setTimeout(() => {
      alert(
        `L'intégration ${
          type === 'apple' ? 'Apple Wallet' : 'Google Wallet'
        } nécessite des certificats développeurs (${
          type === 'apple' ? 'Apple Developer Program' : 'Google Pay API'
        }).\n\nPour le MVP, cette action simulée montre où les membres pourront télécharger leur carte au format .pkpass / JWT directement dans leur téléphone !`
      );
      setLoading(null);
    }, 800);
  };

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-neutral-200"></div>
        <span className="shrink-0 px-4 text-xs font-medium text-neutral-400 uppercase tracking-wider">
          Digitaliser cette carte
        </span>
        <div className="flex-grow border-t border-neutral-200"></div>
      </div>

      <button
        onClick={() => handleWalletAdd('apple')}
        disabled={loading !== null}
        className="flex items-center justify-center gap-3 rounded-xl bg-black px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-neutral-800 disabled:opacity-50"
      >
        {loading === 'apple' ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <Apple className="h-5 w-5" />
        )}
        Ajouter à Apple Wallet
      </button>

      <button
        onClick={() => handleWalletAdd('google')}
        disabled={loading !== null}
        className="flex items-center justify-center gap-3 rounded-xl bg-white border border-neutral-200 px-4 py-3.5 text-sm font-semibold text-neutral-800 shadow-sm transition-all hover:bg-neutral-50 disabled:opacity-50"
      >
        {loading === 'google' ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-800 border-t-transparent" />
        ) : (
          <Smartphone className="h-5 w-5 text-blue-500" />
        )}
        Ajouter à Google Wallet
      </button>
    </div>
  );
}
