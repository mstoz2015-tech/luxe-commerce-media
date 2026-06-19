import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Session, User } from '@supabase/supabase-js';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return createDummyClient() as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore in Server Components (read-only)
        }
      },
    },
  });
}

// Dummy client for when Supabase is not configured
function createDummyClient() {
  const emptyArr = { data: [] as any[], error: null };
  const nullData = { data: null as any, error: null };
  const configError = { error: new Error('Supabase not configured') };

  return {
    auth: {
      getSession: async () => ({ data: { session: null as Session | null }, error: null }),
      getUser: async () => ({ data: { user: null as User | null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signOut: async () => ({}),
      signInWithOtp: async () => configError,
      exchangeCodeForSession: async () => configError,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => emptyArr,
          limit: () => emptyArr,
          single: async () => nullData,
        }),
        order: () => emptyArr,
        limit: () => emptyArr,
        single: async () => nullData,
      }),
      insert: () => configError,
      update: () => ({ eq: () => configError }),
      delete: () => ({ eq: () => configError }),
    }),
    storage: {
      from: () => ({
        upload: async () => configError,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}
