'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, IdCard, Calendar, FileBadge, Menu, BookOpen } from 'lucide-react';

const MOBILE_NAV = [
  { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Membres', href: '/dashboard/members', icon: Users },
  { label: 'Cours', href: '/dashboard/courses', icon: BookOpen },
  { label: 'Cartes', href: '/dashboard/cards', icon: IdCard },
  { label: 'Plus', href: '/dashboard/menu', icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-t border-neutral-200 bg-white px-2 pb-safe sm:hidden print:hidden">
      {MOBILE_NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-1/5 h-full space-y-1 ${
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
