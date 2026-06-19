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

// Chainable dummy client — every method returns a chainable object
function chainable(data: any = []) {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return undefined; // Not a Promise
      // Methods that should return data
      if (prop === 'data') return data;
      if (prop === 'error') return null;
      // All other methods return a new chainable
      return () => chainable(data);
    },
  };
  return new Proxy(async () => ({ data, error: null }), handler);
}

function createDummyClient() {
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
    from: () => chainable([]),
    storage: {
      from: () => ({
        upload: async () => configError,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as any;
}
