import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Client utilisé dans les Server Components, Server Actions et Route Handlers.
// Respecte la session de l'utilisateur connecté via les cookies —
// c'est ce qui permet aux policies RLS de s'appliquer correctement
// (auth.uid() est résolu à partir de cette session).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré si un middleware
            // rafraîchit déjà les sessions utilisateur.
          }
        },
      },
    }
  );
}

// Client "admin" — clé service_role, à utiliser UNIQUEMENT dans des
// Route Handlers serveur pour des opérations SUPER_ADMIN explicites
// qui doivent traverser plusieurs organisations. Ne jamais importer
// ce fichier depuis un composant client.
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* no-op : client sans session utilisateur */
        },
      },
    }
  );
}
