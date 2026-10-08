'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UploadCloud } from 'lucide-react';

const RESERVED_SLUGS = new Set(['admin', 'dashboard', 'login', 'signup', 'onboarding', 'verify', 'api', '_next', 'impact', 'settings']);

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function SettingsClient({
  orgId,
  currentLogo,
  currentName,
  currentSlug,
  currentMemberPrefix,
  currentColorPrimary,
  currentColorSecondary,
}: {
  orgId: string;
  currentLogo: string | null;
  currentName: string;
  currentSlug: string;
  currentMemberPrefix: string | null;
  currentColorPrimary: string;
  currentColorSecondary: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(currentName);
  const [slug, setSlug] = useState(currentSlug);
  const [acronym, setAcronym] = useState(currentMemberPrefix || '');
  const [colorPrimary, setColorPrimary] = useState(currentColorPrimary || '#16A34A');
  const [colorSecondary, setColorSecondary] = useState(currentColorSecondary || '#1D4ED8');

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (slug === currentSlug) {
      setSlugStatus('idle');
      return;
    }
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
  }, [slug, currentSlug, supabase]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('La taille du logo ne doit pas dépasser 2Mo.');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orgId}-logo-${Date.now()}.${fileExt}`;
      const filePath = `${orgId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organizations')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organizations')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', orgId);

      if (updateError) throw updateError;
      
      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors du téléversement du logo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (slugStatus === 'taken' || RESERVED_SLUGS.has(slug)) {
      setError("Ce slug n'est pas disponible.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        name, 
        slug,
        member_prefix: acronym || null,
        color_primary: colorPrimary, 
        color_secondary: colorSecondary 
      })
      .eq('id', orgId);

    setLoading(false);
    if (updateError) {
      setError(updateError.message.includes('duplicate') ? 'Ce slug est déjà pris.' : 'Erreur lors de la sauvegarde.');
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Logo de l'organisation</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
            {currentLogo ? (
              <img src={currentLogo} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-2xl font-bold text-neutral-300">
                {name.charAt(0) || 'O'}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Upload...' : 'Changer le logo'}
              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </label>
            <span className="text-[10px] text-neutral-500">
              Format: JPG, PNG, WEBP. Max 2Mo.
            </span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold mb-1">Nom de l'organisation</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Sigle / Acronyme</label>
          <input
            value={acronym}
            onChange={(e) => {
              setAcronym(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            }}
            maxLength={6}
            placeholder="Ex : ADS"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring uppercase"
          />
          <p className="text-xs text-neutral-500 mt-1">2 à 6 caractères, utilisé pour numéroter les membres.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Lien d'impact (Slug)</label>
          <input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            required
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

        <div>
          <label className="block text-sm font-semibold mb-1">Couleur Primaire (Dégradé)</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={colorPrimary}
              onChange={(e) => setColorPrimary(e.target.value)}
              className="h-9 w-9 rounded border border-neutral-300 p-0.5 cursor-pointer"
            />
            <input
              type="text"
              value={colorPrimary}
              onChange={(e) => setColorPrimary(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus-ring"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Couleur Secondaire (Dégradé)</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={colorSecondary}
              onChange={(e) => setColorSecondary(e.target.value)}
              className="h-9 w-9 rounded border border-neutral-300 p-0.5 cursor-pointer"
            />
            <input
              type="text"
              value={colorSecondary}
              onChange={(e) => setColorSecondary(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus-ring"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium">Modifications enregistrées.</p>}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading || uploading || slugStatus === 'taken'}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 premium-shadow"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </form>
  );
}
