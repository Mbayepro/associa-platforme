'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message || "Une erreur est survenue lors de la réinitialisation.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 bg-neutral-50/50">
        <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Vérifiez vos emails</h1>
          <p className="text-sm text-neutral-600">
            Un lien pour réinitialiser votre mot de passe a été envoyé à l'adresse <strong>{email}</strong>.
          </p>
          <div className="pt-4">
            <Link href="/login" className="text-sm font-medium text-brand-primary hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-neutral-50/50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
        <Link href="/login" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">Mot de passe oublié</h1>
          <p className="text-sm text-neutral-500">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 pl-10 pr-3 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </main>
  );
}
