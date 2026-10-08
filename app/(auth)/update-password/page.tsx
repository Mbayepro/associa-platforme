'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verification if user session exists (the link contains an access token that supabase automatically extracts)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Votre lien de réinitialisation est invalide ou a expiré. Veuillez refaire la demande.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Une erreur est survenue lors de la mise à jour.");
      return;
    }

    setSuccess(true);
    // Redirect after 3 seconds
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 bg-neutral-50/50">
        <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Mot de passe mis à jour !</h1>
          <p className="text-sm text-neutral-600">
            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers le tableau de bord...
          </p>
          <div className="pt-4">
            <Link href="/dashboard" className="text-sm font-medium text-brand-primary hover:underline">
              Aller au tableau de bord
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-neutral-50/50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
        <div className="space-y-2 text-center mb-2">
          <div className="mx-auto w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-brand-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Nouveau mot de passe</h1>
          <p className="text-sm text-neutral-500">
            Veuillez entrer votre nouveau mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </main>
  );
}
