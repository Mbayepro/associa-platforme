'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(
        "Impossible de créer le compte. Vérifiez vos informations et réessayez."
      );
      return;
    }

    router.push('/onboarding');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Créer votre compte</h1>
          <p className="text-sm text-neutral-600">
            Étape 1 sur 2 — vous créerez votre organisation ensuite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nom</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Création…' : 'Continuer'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-600">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-brand-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
