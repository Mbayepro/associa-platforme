'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIGenerateButtonProps {
  onGenerate: (text: string) => void;
  promptSource: string; // The title or context to generate from
  contextType: 'course_description' | 'event_description' | 'generic';
  className?: string;
}

export function AIGenerateButton({ onGenerate, promptSource, contextType, className = '' }: AIGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!promptSource) {
      alert("Veuillez d'abord saisir un titre avant de générer la description.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptSource, context: contextType }),
      });

      if (!response.ok) throw new Error("Erreur réseau");
      
      const data = await response.json();
      if (data.text) {
        onGenerate(data.text);
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error(error);
      alert("La génération IA a échoué.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all ${className}`}
      title="Générer avec l'Intelligence Artificielle"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {isLoading ? "Génération magique..." : "Générer avec l'IA"}
    </button>
  );
}
