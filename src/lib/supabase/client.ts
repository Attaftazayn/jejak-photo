import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser‑side Supabase client factory.
 * Uses the public URL and anon key from environment variables.
 */
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
