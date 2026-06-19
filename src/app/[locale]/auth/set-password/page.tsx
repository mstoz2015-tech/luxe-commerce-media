'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError('');

    const supabase = createClient();

    // Update password and set metadata flag
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { password_set: true },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Redirect to dashboard
    router.push('/fr/dashboard');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">
        Créez votre mot de passe
      </h1>
      <p className="mb-8 text-zinc-500">
        Bienvenue <strong>{email}</strong> ! Choisissez un mot de passe pour sécuriser votre compte.
      </p>

      <form onSubmit={handleSetPassword} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="Minimum 6 caractères"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
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
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  );
}
