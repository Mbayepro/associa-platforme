'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  IdCard, 
  GraduationCap, 
  Calendar, 
  QrCode, 
  FileBadge, 
  Briefcase, 
  TrendingUp, 
  Handshake, 
  Newspaper,
  LogOut,
  Settings,
  BookOpen
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'Membres', href: '/dashboard/members', icon: Users, enabled: true, adminOnly: true },
  { label: 'Cartes', href: '/dashboard/cards', icon: IdCard, enabled: true, adminOnly: true },
  { label: 'Formations', href: '/dashboard/trainings', icon: GraduationCap, enabled: true },
  ...(process.env.NEXT_PUBLIC_ENABLE_COURSES === 'true'
    ? [{ label: 'E-Learning', href: '/dashboard/courses', icon: BookOpen, enabled: true }]
    : []),
  { label: 'Événements', href: '/dashboard/events', icon: Calendar, enabled: true },
  { label: 'Présences', href: '/dashboard/scan', icon: QrCode, enabled: true, managerOnly: true },
  { label: 'Attestations', href: '/dashboard/certificates', icon: FileBadge, enabled: true },
  { label: 'Actions', href: '/dashboard/actions', icon: Briefcase, enabled: true },
  { label: 'Impact', href: '/dashboard/impact', icon: TrendingUp, enabled: true, adminOnly: true },
  { label: 'Partenaires', href: '/dashboard/partners', icon: Handshake, enabled: true, adminOnly: true },
  { label: 'Actualités', href: '/dashboard/posts', icon: Newspaper, enabled: true },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings, enabled: true, adminOnly: true },
];

export function Sidebar({
  orgName,
  role,
}: {
  orgName?: string;
  role?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden print:hidden w-[280px] flex-col border-r border-neutral-200/50 dark:border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl p-6 sm:flex transition-all shadow-[1px_0_40px_rgba(0,0,0,0.03)]">
      <div className="mb-10 flex items-center gap-4 px-2 group">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white font-bold shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-105 duration-300">
          {orgName ? orgName.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-base font-bold text-neutral-900 dark:text-white transition-colors">
            {orgName || 'ASSOCIA'}
          </p>
          <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full inline-block">
            {role === 'admin' ? 'Administrateur' : role || 'Espace membre'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          // Check permissions
          const isAdmin = role === 'ADMIN';
          const isManager = role === 'ADMIN' || role === 'EVENT_MANAGER' || role === 'TRAINING_MANAGER' || role === 'SCANNER';
          
          if (item.adminOnly && !isAdmin) return null;
          if (item.managerOnly && !isManager) return null;

          const active = pathname === item.href;
          const Icon = item.icon;
          
          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className="group flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-400"
              >
                <Icon className="h-5 w-5 opacity-40" />
                <span>{item.label}</span>
                <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Bientôt
                </span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 ${
                active
                  ? 'bg-brand-primary/10 text-brand-primary shadow-sm ring-1 ring-brand-primary/20'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white hover:translate-x-1'
              }`}
            >
              <Icon className={`h-5 w-5 transition-all duration-300 ${active ? 'text-brand-primary scale-110' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:ring-1 hover:ring-red-200"
        >
          <LogOut className="h-5 w-5 text-neutral-400 dark:text-neutral-500 transition-colors group-hover:text-red-500 dark:group-hover:text-red-400" />
          <span className="tracking-wide">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );
}
