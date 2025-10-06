import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// Support both client-facing NEXT_PUBLIC_* env vars and server-only env names
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Prefer NEXT_PUBLIC for the
// default client so client bundles don't accidentally include service role keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Server key fallback: prefer a service role key for server operations when present
const supabaseServerKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  // Provide a clearer error at build/runtime if env is missing
  throw new Error('Supabase configuration error: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required. Set it in your environment or Vercel dashboard.');
}

// Default client: use the public anon key when available. If only a server key is
// present, fall back to it (server-only deployments should prefer setting the
// public NEXT_PUBLIC key for client usage and keep service role key secret).
const defaultKey = supabaseAnonKey ?? supabaseServerKey;

if (!defaultKey) {
  throw new Error('Supabase configuration error: an anon or service key is required (NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY).');
}

// Default client: do NOT force `no-store` here so Next.js can statically render
// pages that call Supabase. Use this client for reads that can be cached/ISR.
export const supabase = createClient(supabaseUrl, defaultKey);

export async function createSupabaseServerClient() {
  const { getToken } = await auth();
  const token = await getToken();

  // Use the service role key when available for server operations; otherwise
  // fall back to the anon key. The service role key must NEVER be sent to the client.
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serverKey) {
    throw new Error('Supabase server configuration error: SUPABASE_SERVICE_ROLE_KEY or a fallback anon key is required for server client.');
  }

  // cast to string because we've already validated presence above
  return createClient(supabaseUrl as string, serverKey as string, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          cache: "no-store",
        });
      },
    },
  });
}
