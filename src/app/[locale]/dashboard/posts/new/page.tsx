'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const postTypes = [
  { value: 'promotion', label: '🏷️ Promotion' },
  { value: 'event', label: '📅 Événement' },
  { value: 'job', label: '💼 Offre d\'emploi' },
  { value: 'news', label: '📰 Actualité' },
];

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    post_type: 'promotion',
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    // Get profile ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      setError('Créez d\'abord votre profil boutique.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('posts').insert({
      profile_id: profile.id,
      user_id: user.id,
      post_type: form.post_type,
      title: form.title,
      content: form.content,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push('../');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">
        Nouvelle publication
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Type de publication
          </label>
          <div className="flex flex-wrap gap-2">
            {postTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm({ ...form, post_type: type.value })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  form.post_type === type.value
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Titre *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="Ex: -20% sur tout le magasin ce weekend !"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Contenu *
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={5}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder="Décrivez votre promotion, événement, ou actualité..."
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Publication...' : 'Publier'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
