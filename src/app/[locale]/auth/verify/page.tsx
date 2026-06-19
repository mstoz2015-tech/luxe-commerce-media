'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const mode = searchParams.get('mode'); // 'register' or undefined (login)

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    // Check if user has a password set
    const hasPassword = data?.user?.user_metadata?.password_set === true;

    if (hasPassword) {
      router.push(`../auth/enter-password?email=${encodeURIComponent(email)}`);
    } else {
      router.push(`../auth/set-password?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        Vérification
      </h1>
      <p className="mb-8 text-zinc-500">
        Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.
        <br />
        Vérifiez vos spams si vous ne le trouvez pas.
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Code de vérification
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-2xl tracking-widest focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="000000"
            autoFocus
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </button>
      </form>
    </div>
  );
}
