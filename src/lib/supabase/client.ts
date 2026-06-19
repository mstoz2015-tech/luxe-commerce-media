import { createBrowserClient } from '@supabase/ssr';
import type { Session, User } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return createDummyClient() as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}

// Dummy client for when Supabase is not configured
// Returns empty/null data instead of crashing
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
