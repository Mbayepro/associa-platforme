'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

const STOP_WORDS = new Set(['pour', 'le', 'la', 'les', 'et', 'de', 'du', 'des', 'un', 'une', 'en', 'a', 'au', 'aux']);
const RESERVED_SLUGS = new Set(['admin', 'dashboard', 'login', 'signup', 'onboarding', 'verify', 'api', '_next', 'impact', 'settings']);

function generateAcronym(name: string) {
  return name
    .split(/[\s-]+/)
    .filter(word => word.length > 0 && !STOP_WORDS.has(word.toLowerCase()))
    .map(word => word[0].toUpperCase())
    .join('')
    .substring(0, 6);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function OnboardingForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [slug, setSlug] = useState('');
  const [country, setCountry] = useState('Sénégal'); // Par défaut
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Auto-generate acronym and slug when name changes, if user hasn't typed manually
  useEffect(() => {
    if (name) {
      const generatedAcronym = generateAcronym(name);
      setAcronym(generatedAcronym);
      const generatedSlug = slugify(generatedAcronym || name);
      setSlug(generatedSlug);
    }
  }, [name]);

  useEffect(() => {
    let active = true;
    const checkSlug = async () => {
      if (!slug) return;
      if (RESERVED_SLUGS.has(slug)) {
        setSlugStatus('taken');
        return;
      }
      setSlugStatus('checking');
      const { data } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle();
      if (!active) return;
      setSlugStatus(data ? 'taken' : 'available');
    };
    
    const timeout = setTimeout(checkSlug, 500);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (slugStatus === 'taken' || RESERVED_SLUGS.has(slug)) {
      setError("Ce slug n'est pas disponible.");
      setLoading(false);
      return;
    }

    let formattedPhone = phone;
    if (phone) {
      try {
        const phoneNumber = parsePhoneNumber(phone, 'SN'); // SN pour Sénégal par défaut
        if (phoneNumber) {
          formattedPhone = phoneNumber.formatInternational();
        }
      } catch (err) {
        // Ignorer l'erreur et garder le texte brut si invalide
      }
    }

    const { error: rpcError } = await (supabase.rpc as any)(
      'create_organization_with_owner',
      {
        p_name: name,
        p_slug: slug,
        p_country: country || null,
        p_city: city || null,
        p_phone: formattedPhone || null,
        p_member_prefix: acronym || null
      }
    );

    setLoading(false);

    if (rpcError) {
      setError(
        rpcError.message.includes('duplicate')
          ? 'Ce nom d\'organisation ou sigle est déjà utilisé.'
          : "Une erreur est survenue lors de la création de l'organisation."
      );
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Nom de l&apos;organisation</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Association pour le Développement Social"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Sigle / Acronyme</label>
          <input
            type="text"
            required
            maxLength={6}
            value={acronym}
            onChange={(e) => {
              setAcronym(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setSlug(slugify(e.target.value));
            }}
            placeholder="Ex : ADS"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring uppercase"
          />
          <p className="text-xs text-neutral-500 mt-1">2 à 6 caractères, ex: ADS</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Lien d'impact</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus-ring ${
              slugStatus === 'taken' ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300'
            }`}
          />
          <p className={`text-xs mt-1 ${slugStatus === 'taken' ? 'text-red-500' : 'text-neutral-500'}`}>
            {slugStatus === 'checking' && 'Vérification...'}
            {slugStatus === 'available' && 'Disponible'}
            {slugStatus === 'taken' && 'Indisponible'}
            {slugStatus !== 'checking' && slugStatus !== 'taken' && `/{slug}/impact`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Pays</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ville</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Téléphone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+221 78 379 63 95"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !name || slugStatus === 'taken'}
        className="w-full rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Création…' : 'Créer mon organisation'}
      </button>
    </form>
  );
}
