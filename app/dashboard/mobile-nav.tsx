'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, IdCard, Calendar, FileBadge, Menu, BookOpen } from 'lucide-react';

const MOBILE_NAV = [
  { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Membres', href: '/dashboard/members', icon: Users, adminOnly: true },
  ...(process.env.NEXT_PUBLIC_ENABLE_COURSES === 'true'
    ? [{ label: 'Cours', href: '/dashboard/courses', icon: BookOpen }]
    : []),
  { label: 'Cartes', href: '/dashboard/cards', icon: IdCard, adminOnly: true },
  { label: 'Événements', href: '/dashboard/events', icon: Calendar, memberOnly: true },
  { label: 'Attestations', href: '/dashboard/certificates', icon: FileBadge, memberOnly: true },
  { label: 'Plus', href: '/dashboard/menu', icon: Menu },
];

export function MobileNav({ role }: { role?: string }) {
  const pathname = usePathname();
  const isAdmin = role === 'ADMIN';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-neutral-200 bg-white px-2 pb-safe sm:hidden print:hidden">
      {MOBILE_NAV.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        if (item.memberOnly && isAdmin) return null; // Show event/cert instead of members for standard users
        
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[64px] px-2 h-full space-y-1 ${
              active ? 'text-brand-primary' : 'text-neutral-500'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'fill-brand-primary/10' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
