import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function CertificatesPage() {
  const supabase = await createClient();

    const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      id,
      title,
      type,
      issued_at,
      status,
      member:members (
        id,
        first_name,
        last_name,
        member_number
      )
    `)
    .order('created_at', { ascending: false });

  const TYPE_LABELS: Record<string, string> = {
    TRAINING: 'Formation',
    FORMATION: 'Formation',
    EVENT: 'Événement',
    MEMBERSHIP: 'Adhésion',
    FELICITATION: 'Félicitation',
    OTHER: 'Autre'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Attestations</h1>
          <p className="text-sm text-neutral-600">
            {certificates?.length ?? 0} attestation{(certificates?.length ?? 0) > 1 ? 's' : ''} délivrée{(certificates?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/certificates/new"
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Délivrer une attestation
        </Link>
      </div>

      {!certificates || certificates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-neutral-600">
            Aucune attestation n'a été délivrée pour le moment.
          </p>
          <Link
            href="/dashboard/certificates/new"
            className="mt-3 inline-block text-sm font-medium text-brand-primary"
          >
            + Délivrer une attestation
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Titre / Type</th>
                <th className="px-4 py-3 font-medium">Membre</th>
                <th className="px-4 py-3 font-medium">Date d'émission</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => {
                const member: any = Array.isArray(cert.member) ? cert.member[0] : cert.member;
                return (
                <tr key={cert.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{cert.title}</p>
                    <p className="text-xs text-neutral-500">{TYPE_LABELS[cert.type?.toUpperCase()] || cert.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">
                      {member?.first_name} {member?.last_name}
                    </p>
                    <p className="text-xs text-neutral-500">{member?.member_number}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {cert.status === 'REVOKED' ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Révoquée</span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Valide</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/certificates/${cert.id}`}
                      className="text-sm font-medium text-brand-primary"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
