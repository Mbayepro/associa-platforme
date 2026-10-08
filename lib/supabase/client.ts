import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Client utilisé dans les Client Components ("use client").
// N'utilise que la clé publique anon — jamais la clé service_role ici.
export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
