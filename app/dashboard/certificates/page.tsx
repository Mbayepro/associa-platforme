import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CertificatesClient } from './certificates-client';

export default async function CertificatesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organizations(id, name, logo_url, color_primary)')
    .eq('user_id', user!.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  const org = (membership as any)?.organizations;

  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      id,
      title,
      type,
      issued_at,
      status,
      verification_token,
      member:members (
        id,
        first_name,
        last_name,
        member_number
      )
    `)
    .eq('organization_id', org?.id)
    .order('created_at', { ascending: false });

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
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 shadow-sm"
        >
          + Délivrer une attestation
        </Link>
      </div>

      <CertificatesClient
        initialCertificates={certificates || []}
        orgName={org?.name || 'Organisation'}
        orgLogo={org?.logo_url}
        colorPrimary={org?.color_primary}
      />
    </div>
  );
}

