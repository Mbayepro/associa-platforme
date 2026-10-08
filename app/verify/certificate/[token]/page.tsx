import { CertificateVisual } from '@/components/certificate-visual';
import { CertificatePreview } from '@/components/certificate-preview';
import { createClient } from '@/lib/supabase/server';

const STATUS_CONFIG: Record<
  string,
  { title: string; color: string; bg: string }
> = {
  VALID: {
    title: 'ATTESTATION AUTHENTIQUE',
    color: 'text-green-800',
    bg: 'bg-green-50 border-green-200',
  },
  REVOKED: {
    title: 'ATTESTATION RÉVOQUÉE',
    color: 'text-red-800',
    bg: 'bg-red-50 border-red-200',
  },
  NOT_FOUND: {
    title: 'ATTESTATION INTROUVABLE',
    color: 'text-neutral-700',
    bg: 'bg-neutral-50 border-neutral-200',
  },
};

const TYPE_LABELS: Record<string, string> = {
  TRAINING: 'Formation',
  FORMATION: 'Formation',
  EVENT: 'Événement',
  MEMBERSHIP: 'Adhésion',
  FELICITATION: 'Félicitation',
  OTHER: 'Autre'
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_certificate_public_info', { p_token: token })
    .single();

  const result = error || !data ? { status: 'NOT_FOUND' } : (data as any);
  const config = STATUS_CONFIG[result.status] ?? STATUS_CONFIG.NOT_FOUND;

  if (result.status === 'VALID') {
    return (
      <main className="min-h-screen bg-neutral-100 py-12 px-4 flex flex-col items-center">
        <div className="mb-6 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 border border-green-200 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Document authentique et vérifié
        </div>
        <div className="w-full max-w-[800px] shadow-2xl bg-white">
          <CertificatePreview>
            <CertificateVisual 
              participantName={`${result.member?.first_name} ${result.member?.last_name}`}
              memberNumber={result.member?.member_number}
              sessionType={result.certificate?.type}
              sessionTitle={result.certificate?.title}
              issuedAt={result.certificate?.issued_at}
              verificationToken={result.certificate?.verification_token}
              orgName={result.organization?.name}
              orgLogo={result.organization?.logo_url}
            />
          </CertificatePreview>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 bg-neutral-50">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 text-center ${config.bg}`}
      >
        <h1 className={`text-lg font-semibold ${config.color}`}>
          {config.title}
        </h1>

        {result.status !== 'NOT_FOUND' && (
          <div className="mt-4 space-y-4 text-sm text-neutral-700">
            <div>
              <p className="font-medium">{result.member?.first_name} {result.member?.last_name}</p>
              <p className="text-neutral-500">N° {result.member?.member_number}</p>
            </div>
            
            <div>
              <p className="font-medium">{result.certificate?.title}</p>
              <p className="text-neutral-500">{TYPE_LABELS[result.certificate?.type?.toUpperCase()] || result.certificate?.type}</p>
              <p className="text-xs text-neutral-500">
                Émise le {new Date(result.certificate?.issued_at).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Réf: {result.certificate?.verification_token}
              </p>
            </div>
            
            <div className="pt-2 border-t border-neutral-200/50">
              <p className="font-medium text-neutral-600">{result.organization?.name}</p>
            </div>
          </div>
        )}

        {result.status === 'NOT_FOUND' && (
          <p className="mt-3 text-sm text-neutral-600">
            Aucune attestation ne correspond à ce code. Vérifiez le lien scanné.
          </p>
        )}
      </div>
    </main>
  );
}
