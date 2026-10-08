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
  { label: 'Membres', href: '/dashboard/members', icon: Users, enabled: true },
  { label: 'Cartes', href: '/dashboard/cards', icon: IdCard, enabled: true },
  { label: 'Formations', href: '/dashboard/trainings', icon: GraduationCap, enabled: true },
  { label: 'E-Learning', href: '/dashboard/courses', icon: BookOpen, enabled: true },
  { label: 'Événements', href: '/dashboard/events', icon: Calendar, enabled: true },
  { label: 'Présences', href: '/dashboard/scan', icon: QrCode, enabled: true },
  { label: 'Attestations', href: '/dashboard/certificates', icon: FileBadge, enabled: true },
  { label: 'Actions', href: '/dashboard/actions', icon: Briefcase, enabled: true },
  { label: 'Impact', href: '/dashboard/impact', icon: TrendingUp, enabled: true },
  { label: 'Partenaires', href: '/dashboard/partners', icon: Handshake, enabled: true },
  { label: 'Actualités', href: '/dashboard/posts', icon: Newspaper, enabled: true },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings, enabled: true },
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
    <aside className="hidden print:hidden w-64 flex-col border-r border-neutral-200/60 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-xl p-4 sm:flex transition-all">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white font-bold premium-shadow">
          {orgName ? orgName.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
            {orgName || 'ASSOCIA'}
          </p>
          <p className="truncate text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {role === 'admin' ? 'Administrateur' : role || 'Espace membre'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          
          if (!item.enabled) {
            return (
              <span
                key={item.href}
                className="group flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400"
              >
                <Icon className="h-5 w-5 opacity-40" />
                <span>{item.label}</span>
                <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                  Bientôt
                </span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-brand-primary/10 text-brand-primary premium-shadow'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 transition-colors ${active ? 'text-brand-primary' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="group mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 transition-all hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-500"
      >
        <LogOut className="h-5 w-5 text-neutral-400 dark:text-neutral-500 transition-colors group-hover:text-red-500 dark:group-hover:text-red-500" />
        Se déconnecter
      </button>
    </aside>
  );
}
