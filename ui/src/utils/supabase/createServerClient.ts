import { createServerClient } from "@supabase/ssr";

interface CookieMethods {
  get: (key: string) => string | undefined;
  set: (key: string, value: string, options?: Record<string, unknown>) => void;
}

export function createServerSupabaseClient(cookies: CookieMethods) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );
}
