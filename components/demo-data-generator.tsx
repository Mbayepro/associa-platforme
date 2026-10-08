'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wand2, Loader2, CheckCircle2 } from 'lucide-react';

export function DemoDataGenerator({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!confirm("Voulez-vous vraiment générer 10 membres et 3 événements de démo ? Cela va peupler votre base de données avec de fausses informations à des fins de test.")) return;

    setIsLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/demo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");

      setSuccess(true);
      router.refresh(); // Rafraîchit les données de la page actuelle
    } catch (error) {
      console.error(error);
      alert("La génération a échoué.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600" /> Mode Démo (Onboarding)
          </h3>
          <p className="text-sm text-blue-700/80 max-w-lg">
            Générez de fausses données (10 membres, 3 événements) d'un seul clic pour voir à quoi ressemble la plateforme avec de l'activité. Idéal pour faire des démonstrations.
          </p>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || success}
          className="whitespace-nowrap inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Magie en cours...</>
          ) : success ? (
            <><CheckCircle2 className="h-4 w-4" /> Données générées !</>
          ) : (
            <><Wand2 className="h-4 w-4" /> Générer la démo</>
          )}
        </button>
      </div>
    </div>
  );
}
