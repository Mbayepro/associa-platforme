import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Mail, Phone, Globe, ArrowRight, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ organization_slug: string }> }): Promise<Metadata> {
  const { organization_slug } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('name, tagline, description, logo_url')
    .eq('slug', organization_slug)
    .maybeSingle();

  if (!org) return { title: 'Associa' };

  return {
    title: `${org.name} | Propulsé par Associa`,
    description: org.tagline || org.description || 'Découvrez notre association sur Associa.',
    openGraph: {
      title: org.name,
      description: org.tagline || org.description || 'Découvrez notre association sur Associa.',
      images: org.logo_url ? [org.logo_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: org.name,
      description: org.tagline || org.description || 'Découvrez notre association sur Associa.',
      images: org.logo_url ? [org.logo_url] : [],
    }
  };
}

export default async function OrganizationPublicPage({
  params,
}: {
  params: Promise<{ organization_slug: string }>;
}) {
  const { organization_slug } = await params;
  const supabase = await createClient();

  // On récupère les infos de l'asso
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', organization_slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  // On récupère les formations publiques (si on veut en afficher)
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, description, cover_url')
    .eq('organization_id', org.id)
    .eq('is_published', true)
    .limit(3);

  const primaryColor = org.color_primary || '#16A34A';

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-brand-primary/20">
      {/* Header / Hero Section */}
      <header className="relative bg-white border-b border-neutral-200 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="mx-auto max-w-5xl px-6 py-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            {org.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="h-32 w-32 rounded-3xl object-cover shadow-lg border border-white" />
            ) : (
              <div 
                className="h-32 w-32 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {org.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900">
                {org.name}
              </h1>
              {org.tagline && (
                <p className="text-xl text-neutral-600 font-medium">
                  {org.tagline}
                </p>
              )}
              
              <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                <Link 
                  href={`/login`} 
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  Adhérer à l'association <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  href={`/${organization_slug}/impact`} 
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-white border border-neutral-300 text-neutral-700 shadow-sm transition-all hover:bg-neutral-50"
                >
                  Voir notre impact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-16">
        
        {/* À propos */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900">À propos de nous</h2>
            <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed">
              {org.description ? (
                <p className="whitespace-pre-wrap">{org.description}</p>
              ) : (
                <p className="italic text-neutral-400">Cette association n'a pas encore ajouté de description.</p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm h-fit space-y-6">
            <h3 className="font-semibold text-neutral-900">Contact & Infos</h3>
            <ul className="space-y-4 text-sm text-neutral-600">
              {org.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-neutral-400" />
                  <a href={`mailto:${org.email}`} className="hover:underline">{org.email}</a>
                </li>
              )}
              {org.phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-neutral-400" />
                  <a href={`tel:${org.phone}`} className="hover:underline">{org.phone}</a>
                </li>
              )}
              {org.website && (
                <li className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-neutral-400" />
                  <a href={org.website} target="_blank" rel="noreferrer" className="hover:underline truncate">{org.website}</a>
                </li>
              )}
            </ul>
          </div>
        </section>

        {/* E-Learning (Si des cours sont disponibles) */}
        {courses && courses.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900">Nos Formations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all">
                  {course.cover_url ? (
                    <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                      <img src={course.cover_url} alt={course.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-neutral-100 flex items-center justify-center">
                      <span className="text-neutral-400 font-medium">Sans image</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-neutral-900 mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-neutral-500 line-clamp-2 flex-1 mb-4">{course.description}</p>
                    <Link 
                      href="/login" 
                      className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: primaryColor }}
                    >
                      Découvrir <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        
      </main>

      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} {org.name}. Tous droits réservés.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Propulsé par <Link href="/" className="font-semibold text-neutral-900 hover:underline">Associa</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
