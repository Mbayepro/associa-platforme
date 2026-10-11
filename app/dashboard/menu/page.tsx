import Link from 'next/link';
import { 
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
  Settings,
  BookOpen
} from 'lucide-react';

const MENU_ITEMS = [
  { label: 'Membres', href: '/dashboard/members', icon: Users },
  { label: 'Cartes', href: '/dashboard/cards', icon: IdCard },
  { label: 'Formations', href: '/dashboard/trainings', icon: GraduationCap },
  ...(process.env.NEXT_PUBLIC_ENABLE_COURSES === 'true'
    ? [{ label: 'E-Learning', href: '/dashboard/courses', icon: BookOpen }]
    : []),
  { label: 'Événements', href: '/dashboard/events', icon: Calendar },
  { label: 'Présences', href: '/dashboard/scan', icon: QrCode },
  { label: 'Attestations', href: '/dashboard/certificates', icon: FileBadge },
  { label: 'Actions', href: '/dashboard/actions', icon: Briefcase },
  { label: 'Impact', href: '/dashboard/impact', icon: TrendingUp },
  { label: 'Partenaires', href: '/dashboard/partners', icon: Handshake },
  { label: 'Actualités', href: '/dashboard/posts', icon: Newspaper },
  { label: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export default function MenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Menu</h1>
        <p className="mt-1 text-sm text-neutral-500">Accédez à toutes les fonctionnalités de votre espace.</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-brand-primary hover:shadow-sm transition-all"
            >
              <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-neutral-900">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
