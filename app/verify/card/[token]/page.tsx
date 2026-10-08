import { createClient } from '@/lib/supabase/server';
import { WalletButtons } from '@/components/wallet-buttons';

const STATUS_CONFIG: Record<
  string,
  { title: string; color: string; bg: string }
> = {
  ACTIVE: {
    title: 'Carte authentifiée',
    color: 'text-green-800',
    bg: 'bg-green-50 border-green-200',
  },
  EXPIRED: {
    title: 'Carte expirée',
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-200',
  },
  SUSPENDED: {
    title: 'Carte suspendue',
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-200',
  },
  REVOKED: {
    title: 'Carte révoquée',
    color: 'text-red-800',
    bg: 'bg-red-50 border-red-200',
  },
  NOT_FOUND: {
    title: 'Carte introuvable',
    color: 'text-neutral-700',
    bg: 'bg-neutral-50 border-neutral-200',
  },
};

export default async function VerifyCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Cette page ne nécessite aucune authentification : elle passe
  // exclusivement par la fonction RPC get_card_public_info, qui ne
  // traverse aucune table protégée par RLS directement et ne renvoie
  // que les champs strictement nécessaires à la vérification publique.
  const { data, error } = await supabase
    .rpc('get_card_public_info', { p_token: token })
    .single();

  const result = error || !data ? { status: 'NOT_FOUND' } : (data as any);
  const config = STATUS_CONFIG[result.status] ?? STATUS_CONFIG.NOT_FOUND;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div
        className={`w-full max-w-sm rounded-2xl border p-6 text-center ${config.bg}`}
      >
        <h1 className={`text-lg font-semibold ${config.color}`}>
          {config.title}
        </h1>

        {result.found && (
          <div className="mt-4 space-y-1 text-sm text-neutral-700">
            <p className="font-medium">{result.member_name}</p>
            <p>{result.organization_name}</p>
            <p className="text-neutral-500">N° {result.member_number}</p>
            {result.expires_at && (
              <p className="text-xs text-neutral-500">
                Valable jusqu&apos;au{' '}
                {new Date(result.expires_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        )}

        {!result.found && (
          <p className="mt-3 text-sm text-neutral-600">
            Aucune carte ne correspond à ce code. Vérifiez le lien scanné.
          </p>
        )}

        {result.found && result.status === 'ACTIVE' && (
          <WalletButtons token={token} />
        )}
      </div>
    </main>
  );
}
