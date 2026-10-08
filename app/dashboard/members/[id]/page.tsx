import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CardActions } from './card-actions';
import { ReceiptActions } from './receipt-actions';

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('members')
    .select('*, organizations(name, logo_url, tagline, address, color_primary, color_secondary)')
    .eq('id', id)
    .maybeSingle() as any;

  if (!member) notFound();

  const { data: cards } = await supabase
    .from('member_cards')
    .select('id, status, verification_token, issued_at, expires_at')
    .eq('member_id', id)
    .order('created_at', { ascending: false });

  const org = (member as any).organizations;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {member.first_name} {member.last_name}
        </h1>
        <p className="text-sm text-neutral-600">
          {member.function ?? 'Membre'} · {member.member_number}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 text-sm">
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Téléphone</dt>
            <dd>{member.phone ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Email</dt>
            <dd>{member.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Statut</dt>
            <dd>{member.status}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Adhésion</dt>
            <dd>{new Date(member.join_date).toLocaleDateString('fr-FR')}</dd>
          </div>
        </dl>
      </div>

      <CardActions
        memberId={member.id}
        memberName={`${member.first_name} ${member.last_name}`}
        memberFunction={member.function}
        memberNumber={member.member_number}
        phone={member.phone}
        photoUrl={member.photo_url}
        orgId={org?.id}
        orgName={org?.name}
        orgLogo={org?.logo_url}
        orgTagline={org?.tagline}
        colorPrimary={org?.color_primary ?? '#16A34A'}
        colorSecondary={org?.color_secondary ?? '#1D4ED8'}
        existingCards={cards ?? []}
      />

      <ReceiptActions
        memberName={`${member.first_name} ${member.last_name}`}
        memberAddress={member.address}
        orgName={org?.name}
        orgAddress={org?.address}
        orgLogo={org?.logo_url}
        memberNumber={member.member_number}
      />
    </div>
  );
}
