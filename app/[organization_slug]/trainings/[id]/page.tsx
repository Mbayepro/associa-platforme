import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, User, Clock, CreditCard } from 'lucide-react';

export default async function PublicTrainingPage({
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

  const { data: training } = await supabase
    .from('trainings')
    .select('*')
    .eq('id', id)
    .eq('organization_id', org.id)
    .eq('status', 'PUBLISHED')
    .maybeSingle();

  if (!training) notFound();

  const primaryColor = org.color_primary || '#16A34A';
  
  const formattedDate = new Date(training.session_date).toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-brand-primary/20">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <Link href={`/${organization_slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à l'association
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          {training.image_url ? (
            <div className="w-full h-64 md:h-96 relative">
              <img src={training.image_url} alt={training.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 text-white">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">Formation en présentiel / direct</span>
                <h1 className="text-3xl md:text-5xl font-extrabold">{training.title}</h1>
              </div>
            </div>
          ) : (
            <div className="w-full bg-neutral-100 p-10 md:p-16 border-b border-neutral-200" style={{ backgroundColor: `${primaryColor}15` }}>
              <span className="inline-block px-3 py-1 bg-white border border-neutral-200 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider text-neutral-600">Formation</span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900">{training.title}</h1>
            </div>
          )}

          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-neutral max-w-none">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">À propos de cette formation</h2>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{training.description || "Aucune description fournie."}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200 space-y-6">
                <h3 className="font-semibold text-neutral-900">Détails de la session</h3>
                
                <ul className="space-y-4 text-sm text-neutral-600">
                  <li className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-neutral-900 capitalize">{formattedDate}</span>
                      {training.session_time && <span className="text-neutral-500">Heure : {training.session_time.substring(0, 5)}</span>}
                    </div>
                  </li>
                  
                  {training.location && (
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-neutral-900">{training.location}</span>
                    </li>
                  )}
                  
                  {training.trainer && (
                    <li className="flex items-start gap-3">
                      <User className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-xs text-neutral-500 uppercase tracking-wider">Formateur</span>
                        <span className="font-medium text-neutral-900">{training.trainer}</span>
                      </div>
                    </li>
                  )}
                  
                  <li className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-medium text-neutral-900">
                        {training.price > 0 ? `${training.price} €` : 'Gratuit'}
                      </span>
                      <span className="text-xs text-neutral-500 uppercase tracking-wider">{training.type}</span>
                    </div>
                  </li>

                  {training.capacity && (
                    <li className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-neutral-900">Capacité : {training.capacity} places</span>
                    </li>
                  )}
                </ul>

                <Link
                  href={`/login`}
                  className="w-full flex justify-center items-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: primaryColor }}
                >
                  S'inscrire à la formation
                </Link>
                <p className="text-xs text-center text-neutral-500 mt-4">
                  {training.type === 'MEMBERS_ONLY' ? "Cette formation est réservée aux membres de l'association." : "Connectez-vous ou créez un compte pour vous inscrire."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
