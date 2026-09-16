import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseBrowserClient: SupabaseClient | undefined;

export function createClient() {
  if (supabaseBrowserClient) return supabaseBrowserClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://placeholder.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  supabaseBrowserClient = createBrowserClient(url, key);

  return supabaseBrowserClient;
}
