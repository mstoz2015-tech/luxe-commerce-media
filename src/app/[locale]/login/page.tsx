'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const t = useTranslations('auth');
  const common = useTranslations('common');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/fr/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">
          {t('magicLinkSent')}
        </h1>
        <p className="text-zinc-500">
          Vérifiez votre boîte email <strong>{email}</strong> et cliquez sur le lien pour vous connecter.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        {t('loginTitle')}
      </h1>
      <p className="mb-8 text-zinc-500">
        {t('noAccount')}{' '}
        <Link href="../register" className="font-medium text-zinc-900 underline">
          {t('createAccount')}
        </Link>
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            {t('email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="contact@votreboutique.lu"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading ? common('loading') : t('loginTitle')}
        </button>
      </form>
    </div>
  );
}
