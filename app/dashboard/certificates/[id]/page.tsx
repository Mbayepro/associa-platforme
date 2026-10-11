import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RevokeCertificateButton } from './revoke-certificate-button';
import { PrintButton } from './print-button';
import { PrintableCertificate } from './printable-certificate';
import Link from 'next/link';

export default async function CertificateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from('certificates')
    .select(`
      *,
      member:members(first_name, last_name, member_number),
      organization:organizations(name, logo_url, color_primary, color_secondary)
    `)
    .eq('id', params.id)
    .single() as any;

  if (!cert) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://associa-platforme.vercel.app');
  const verificationUrl = `${baseUrl}/verify/certificate/${cert.verification_token}`;

  const TYPE_LABELS: Record<string, string> = {
    TRAINING: 'Formation',
    FORMATION: 'Formation',
    EVENT: 'Événement',
    MEMBERSHIP: 'Adhésion',
    FELICITATION: 'Félicitation',
    OTHER: 'Autre'
  };

  return (
    <div>
      {/* ── VUE ÉCRAN (masquée à l'impression) ─────────────────── */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{cert.title}</h1>
            <p className="text-sm text-neutral-600">Attestation · {TYPE_LABELS[cert.type?.toUpperCase()] || cert.type}</p>
          </div>
          <div className="flex items-center gap-4">
            <PrintButton />
            <Link href="/dashboard/certificates" className="text-sm font-medium text-brand-primary">
              &larr; Retour aux attestations
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 bg-neutral-50 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">{cert.title}</h2>
                <p className="mt-1 text-sm text-neutral-500">Type : {TYPE_LABELS[cert.type?.toUpperCase()] || cert.type}</p>
              </div>
              {cert.status === 'REVOKED' ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  Révoquée
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  Valide
                </span>
              )}
            </div>
          </div>

          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Bénéficiaire</h3>
                <p className="mt-1 font-medium text-neutral-900">
                  {cert.member.first_name} {cert.member.last_name}
                </p>
                <p className="text-sm text-neutral-500">N° {cert.member.member_number}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Détails</h3>
                <p className="mt-1 text-sm text-neutral-900 whitespace-pre-wrap">
                  {cert.description || 'Aucune description additionnelle.'}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Date d&apos;émission</h3>
                <p className="mt-1 text-sm text-neutral-900">
                  {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-neutral-300 p-6 flex flex-col items-center text-center justify-center bg-neutral-50">
              <h3 className="font-semibold text-neutral-900 mb-2">Vérification publique</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Partagez ce lien ou générez un QR code pour permettre à des tiers de vérifier l&apos;authenticité de cette attestation.
              </p>
              <div className="bg-white px-3 py-2 border border-neutral-200 rounded text-xs font-mono text-neutral-500 break-all select-all w-full mb-4">
                {verificationUrl}
              </div>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 w-full text-center"
              >
                Ouvrir la page de vérification
              </a>
            </div>
          </div>

          {cert.status !== 'REVOKED' && (
            <div className="border-t border-neutral-100 bg-red-50/50 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-red-900">Zone de danger</h3>
                <p className="text-xs text-red-700">Révoquer cette attestation rendra le lien de vérification invalide.</p>
              </div>
              <RevokeCertificateButton certificateId={cert.id} />
            </div>
          )}
        </div>
      </div>

      {/* ── VUE IMPRESSION (1 page, masquée à l'écran) ─────────── */}
      <PrintableCertificate certificate={cert} verificationUrl={verificationUrl} />
    </div>
  );
}
