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

// Chainable dummy client — every method returns a chainable object
function chainable(data: any = []) {
  const handler: ProxyHandler<any> = {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === 'data') return data;
      if (prop === 'error') return null;
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
