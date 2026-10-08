'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, UploadCloud } from 'lucide-react';
import { AIGenerateButton } from '@/components/ai-generate-button';

export function NewCourseForm({ organizationId }: { organizationId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true);
      setError(null);
      
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `course-thumbnails/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('courses')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('courses')
        .getPublicUrl(filePath);

      setThumbnailUrl(publicUrl);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError("Erreur lors du téléchargement de l'image. Avez-vous exécuté le script SQL pour le bucket 'courses' ?");
    } finally {
      setUploadingImage(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: insertError } = await supabase
      .from('courses')
      .insert({
        organization_id: organizationId,
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        is_published: false,
      })
      .select('id')
      .single();

    setLoading(false);

    if (insertError) {
      console.error(insertError);
      setError('Une erreur est survenue lors de la création du cours.');
      return;
    }

    router.push(`/dashboard/courses/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
          Titre du cours <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Introduction à l'Intelligence Artificielle"
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-200">
            Description
          </label>
          <AIGenerateButton 
            promptSource={title} 
            contextType="course_description" 
            onGenerate={setDescription} 
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Décrivez brièvement le contenu et les objectifs de ce cours..."
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2.5 text-sm transition-all focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-900 dark:text-neutral-200">
          Image de couverture (optionnel)
        </label>
        
        {thumbnailUrl ? (
          <div className="relative mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <img src={thumbnailUrl} alt="Aperçu" className="h-full w-full object-cover" />
            <button 
              type="button" 
              onClick={() => setThumbnailUrl('')}
              className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-md hover:bg-black/70 transition-colors"
            >
              Changer
            </button>
          </div>
        ) : (
          <div className="mt-2 flex justify-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 px-6 py-8 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
            <div className="text-center">
              {uploadingImage ? (
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-primary" />
              ) : (
                <UploadCloud className="mx-auto h-8 w-8 text-neutral-400" />
              )}
              <div className="mt-4 flex text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-brand-primary focus-within:outline-none hover:text-brand-primary/80">
                  <span>Télécharger un fichier</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs leading-5 text-neutral-500">PNG, JPG, GIF jusqu'à 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Créer le cours'
          )}
        </button>
      </div>
    </form>
  );
}
