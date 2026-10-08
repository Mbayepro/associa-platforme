import { createClient } from '@/lib/supabase/server';
import { Users, IdCard, Calendar, GraduationCap, FileBadge, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { DashboardChart } from './components/dashboard-chart';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnimatedKPIGrid, AnimatedKPICard } from './components/animated-kpi-grid';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organizations(id, name, is_demo, logo_url), role')
    .eq('user_id', user!.id)
    .eq('status', 'ACTIVE')
    .limit(1)
    .maybeSingle();

  const org = (membership as any)?.organizations;
  const orgId = org?.id;

  // KPIs
  const { count: memberCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('organization_id', orgId);

  const { count: activeCardCount } = await supabase
    .from('member_cards')
    .select('*, members!inner(organization_id)', { count: 'exact', head: true })
    .eq('status', 'ACTIVE')
    .eq('members.organization_id', orgId);

  const { count: actionsCount } = await (supabase.from('actions') as any)
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  // Latest registrations
  const { data: latestMembers } = await supabase
    .from('members')
    .select('id, first_name, last_name, join_date, photo_url')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('join_date', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center">
            {org?.logo_url ? (
              <img src={org.logo_url} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-brand-primary">{org?.name?.charAt(0) || 'O'}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Bonjour 👋
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Espace de {org?.name}
              {org?.is_demo && (
                <span className="ml-2 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
                  Démo
                </span>
              )}
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* KPIs */}
      <AnimatedKPIGrid>
        <AnimatedKPICard label="Membres" value={memberCount ?? 0} icon={<Users className="h-5 w-5" />} href="/dashboard/members" color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <AnimatedKPICard label="Cartes actives" value={activeCardCount ?? 0} icon={<IdCard className="h-5 w-5" />} href="/dashboard/cards" color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <AnimatedKPICard label="Actions" value={actionsCount ?? 0} icon={<Briefcase className="h-5 w-5" />} href="/dashboard/actions" color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <AnimatedKPICard label="Formations" value="—" icon={<GraduationCap className="h-5 w-5" />} href="/dashboard/courses" color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
        <AnimatedKPICard label="Événements" value="—" icon={<Calendar className="h-5 w-5" />} href="/dashboard/events" color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />
        <AnimatedKPICard label="Attestations" value="—" icon={<FileBadge className="h-5 w-5" />} href="/dashboard/certificates" color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" />
      </AnimatedKPIGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Chart (placeholder styled) */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Activité de l'année</h2>
          <DashboardChart />
        </div>

        {/* Dernières inscriptions */}
        <div className="rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Nouveaux membres</h2>
          {latestMembers && latestMembers.length > 0 ? (
            <div className="space-y-4 flex-1">
              {latestMembers.map((m) => (
                <Link key={m.id} href={`/dashboard/members/${m.id}`} className="flex items-center gap-3 group">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white group-hover:text-brand-primary transition-colors">
                      {m.first_name} {m.last_name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {new Date(m.join_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">Aucun membre</p>
              <p className="text-xs text-neutral-500 mt-1">Commencez par ajouter des membres.</p>
            </div>
          )}
          <Link href="/dashboard/members" className="mt-6 block text-center text-sm font-medium text-brand-primary hover:underline">
            Voir tout
          </Link>
        </div>
      </div>
    </div>
  );
}


