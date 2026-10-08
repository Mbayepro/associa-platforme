'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Users,
  IdCard,
  GraduationCap,
  Calendar,
  TrendingUp,
  QrCode,
  ArrowRight,
  ChevronDown,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

/* ——— Marquee / Infinite carousel data ——— */
const CAROUSEL_ITEMS = [
  {
    icon: Users,
    title: 'Gestion des membres',
    desc: 'Ajoutez, organisez et suivez tous vos adhérents.',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    icon: IdCard,
    title: 'Cartes numériques',
    desc: 'Cartes virtuelles avec QR code vérifiable en un scan.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: GraduationCap,
    title: 'Formations',
    desc: 'Parcours de formation et attestations automatisées.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: Calendar,
    title: 'Événements',
    desc: 'Planifiez vos événements et gérez les inscriptions.',
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    icon: QrCode,
    title: 'Pointage QR',
    desc: 'Suivez la présence le jour J par simple scan.',
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    icon: TrendingUp,
    title: "Mesure d'impact",
    desc: "Suivez vos indicateurs et valorisez vos résultats.",
    color: '#ef4444',
    bg: '#fef2f2',
  },
];

export default function HomePage() {
  const trackRef = useRef<HTMLDivElement>(null);

  /* Infinite marquee animation */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5; // px per frame

    function animate() {
      pos -= speed;
      const half = track!.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track!.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] dark:bg-neutral-950 transition-colors">
      {/* ═══════════════════════════════════════
          HERO — Full-screen immersive
      ═══════════════════════════════════════ */}
      <section className="relative flex min-h-[92vh] flex-col">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Navigation */}
        <header className="relative z-20 flex items-center justify-between px-6 py-5 lg:px-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
              <Image src="/logo.jpg" alt="Associa Logo" width={36} height={36} className="object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Associa
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex rounded-full px-5 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition-all hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px"
            >
              Démarrer gratuitement
            </Link>
          </nav>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-emerald-200 mb-8"
          >
            <Zap className="h-3.5 w-3.5" />
            La plateforme pensée pour les associations
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Gérez votre association.
            <br />
            <span className="text-emerald-300">Simplement.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
          >
            Associa regroupe la gestion de vos membres, événements, formations, 
            attestations et impact — dans un seul espace simple et sécurisé.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-emerald-800 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Créer mon espace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/10"
            >
              J&apos;ai déjà un compte
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8">
          <ChevronDown className="h-6 w-6 text-white/40 animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CARROUSEL — Défilement continu (marquee)
      ═══════════════════════════════════════ */}
      <section className="relative -mt-16 z-20 py-8">
        <div className="overflow-hidden">
          <div ref={trackRef} className="flex gap-5 w-max will-change-transform">
            {/* Double the items for seamless loop */}
            {[...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-72 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-lg shadow-neutral-900/[0.04] transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          À QUOI ÇA SERT — Split text + visual
      ═══════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                À quoi ça sert ?
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl leading-tight">
                Tout ce que vous faites sur papier,
                <br className="hidden sm:block" />
                Associa le fait en ligne.
              </h2>
              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: Users,
                    text: 'Enregistrez vos membres avec leurs coordonnées, rôles et cotisations.',
                  },
                  {
                    icon: GraduationCap,
                    text: 'Créez des formations et délivrez des attestations vérifiables par QR code.',
                  },
                  {
                    icon: Calendar,
                    text: "Organisez vos événements, gérez les inscriptions et pointez les présences.",
                  },
                  {
                    icon: TrendingUp,
                    text: "Mesurez l'impact de vos actions avec des indicateurs concrets.",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                        <Icon className="h-4.5 w-4.5 text-emerald-600" />
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual — Dashboard mockup */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-100/50 to-teal-100/30 dark:from-emerald-900/20 dark:to-teal-900/20 blur-2xl" />
              <div className="relative rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-900/[0.06] overflow-hidden">
                {/* Window bar */}
                <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="rounded-md bg-neutral-50 px-16 py-1 text-[10px] text-neutral-400">
                      associa.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Fake dashboard content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800">Tableau de bord</p>
                      <p className="text-[10px] text-neutral-400">Mon Association</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { n: 'Membres', v: '—', c: 'text-emerald-600' },
                      { n: 'Événements', v: '—', c: 'text-blue-600' },
                      { n: 'Formations', v: '—', c: 'text-violet-600' },
                    ].map((s) => (
                      <div key={s.n} className="rounded-xl bg-neutral-50 p-3 border border-neutral-100">
                        <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                        <p className="text-[10px] text-neutral-400">{s.n}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-100">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Activité récente</p>
                    <div className="space-y-2">
                      {['Nouveau membre inscrit', 'Formation terminée', 'Événement créé'].map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <p className="text-xs text-neutral-500">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALEURS — Why choose Associa
      ═══════════════════════════════════════ */}
      <section className="bg-white dark:bg-neutral-950 transition-colors py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
              Pourquoi Associa ?
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Conçu pour les associations,
              <br className="hidden sm:block" />
              pas pour les entreprises.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Simple à utiliser',
                desc: "Pas besoin d'être expert en informatique. Si vous savez utiliser un téléphone, vous savez utiliser Associa.",
                color: 'text-amber-600',
                bg: 'bg-amber-50',
              },
              {
                icon: Shield,
                title: 'Sécurisé',
                desc: 'Vos données sont protégées et chiffrées. Chaque association a son espace privé.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: Globe,
                title: 'Accessible partout',
                desc: "Depuis un téléphone, une tablette ou un ordinateur. Votre association est toujours avec vous.",
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 text-center transition-all hover:shadow-lg hover:shadow-neutral-900/[0.03] hover:-translate-y-1"
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} mb-6`}>
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — Dark section
      ═══════════════════════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 px-8 py-16 text-center sm:px-16 lg:px-24 lg:py-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
            
            <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
              Prêt à simplifier
              <br />
              votre gestion ?
            </h2>
            <p className="relative mt-4 text-emerald-200/70 max-w-md mx-auto">
              Créez votre espace en quelques clics et commencez à organiser 
              votre association comme elle le mérite.
            </p>
            <div className="relative mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-900 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Commencer maintenant
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                Déjà inscrit ? Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 py-8 px-6 lg:px-16">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Associa Logo" width={24} height={24} className="rounded-md object-contain" />
            <span className="text-sm font-semibold text-neutral-500">Associa</span>
          </div>
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Associa. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
