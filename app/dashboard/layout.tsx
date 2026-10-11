import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

/** Convertit #rrggbb en "r g b" pour les CSS vars Tailwind */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '22 163 74';
  return `${r} ${g} ${b}`;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Récupère la première organisation active de l'utilisateur, avec son rôle.
  // RLS garantit déjà qu'on ne peut lire que ce à quoi on a droit.
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role, organizations(id, name, slug, logo_url, color_primary, color_secondary)')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect('/onboarding');
  }

  const org = (membership as any).organizations;
  const role = (membership as any).role as string;

  return (
    <div
      className="flex min-h-screen pb-16 sm:pb-0"
      style={
        {
          '--brand-primary': hexToRgb(org?.color_primary ?? '#16a34a'),
          '--brand-secondary': hexToRgb(org?.color_secondary ?? '#1d4ed8'),
        } as React.CSSProperties
      }
    >
      <Sidebar orgName={org?.name} role={role} />
      <main className="flex-1 p-4 sm:p-8 print:p-0">{children}</main>
      <MobileNav role={role} />
    </div>
  );
}
