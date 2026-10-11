import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, User, Clock, CheckCircle } from 'lucide-react';

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ organization_slug: string; id: string }>;
}) {
  const { organization_slug, id } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, color_primary, logo_url')
    .eq('slug', organization_slug)
    .maybeSingle();

  if (!org) notFound();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('organization_id', org.id)
    .eq('status', 'PUBLISHED')
    .maybeSingle();

  if (!event) notFound();

  const primaryColor = org.color_primary || '#3B82F6';
  
  const formattedDate = new Date(event.event_date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-brand-primary/20">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <Link href={`/${organization_slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'association
          </Link>
          <div className="flex items-center gap-3">
            {org.logo_url && (
              <img src={org.logo_url} alt={org.name} className="w-8 h-8 rounded-full object-cover border border-neutral-200" />
            )}
            <span className="font-semibold text-neutral-900">{org.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          {event.image_url ? (
            <div className="w-full h-64 md:h-96 relative">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
                  Événement • {event.event_type}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">{event.title}</h1>
              </div>
            </div>
          ) : (
            <div className="w-full bg-neutral-100 p-10 md:p-16 border-b border-neutral-200 relative overflow-hidden" style={{ backgroundColor: `${primaryColor}10` }}>
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: primaryColor }} />
              <span className="inline-block px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider text-neutral-600 relative z-10">
                Événement • {event.event_type}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 relative z-10">{event.title}</h1>
            </div>
          )}

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10 bg-white">
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">À propos de cet événement</h2>
                <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap text-lg">
                  {event.description || "Aucune description fournie pour cet événement."}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-6 shadow-sm">
                <h3 className="font-semibold text-neutral-900 text-lg border-b border-neutral-200 pb-4">Détails pratiques</h3>
                
                <ul className="space-y-5 text-sm text-neutral-600">
                  <li className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm text-neutral-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="pt-1">
                      <span className="block font-semibold text-neutral-900 capitalize">{formattedDate}</span>
                      {event.event_time && <span className="text-neutral-500 font-medium">{event.event_time.substring(0, 5)}</span>}
                    </div>
                  </li>
                  
                  {event.location && (
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm text-neutral-500">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-neutral-900 pt-2">{event.location}</span>
                    </li>
                  )}
                  
                  {event.organizer && (
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm text-neutral-500">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Organisateur</span>
                        <span className="font-medium text-neutral-900">{event.organizer}</span>
                      </div>
                    </li>
                  )}
                  
                  {event.capacity && (
                    <li className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm text-neutral-500">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-neutral-900 pt-2">Places limitées : {event.capacity} pers.</span>
                    </li>
                  )}
                </ul>

                <div className="pt-4 border-t border-neutral-200">
                  <Link
                    href={`/login`}
                    className="w-full flex justify-center items-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirmer ma présence
                  </Link>
                  <p className="text-xs text-center text-neutral-500 mt-4 px-2">
                    Vous devez vous connecter ou créer un compte membre pour participer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
