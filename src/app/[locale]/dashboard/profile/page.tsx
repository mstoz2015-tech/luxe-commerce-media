'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const categories = [
  'Alimentation',
  'Mode',
  'Santé & Bien-être',
  'Maison & Déco',
  'Services',
  'Loisirs',
  'Technologie',
  'Autre',
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    city: '',
    phone: '',
    website: '',
  });

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setExistingProfile(profile);
        setForm({
          name: profile.name || '',
          description: profile.description || '',
          category: profile.category || '',
          address: profile.address || '',
          city: profile.city || '',
          phone: profile.phone || '',
          website: profile.website || '',
        });
      }
    }
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Vous devez être connecté.');
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,
      name: form.name,
      description: form.description,
      category: form.category,
      address: form.address,
      city: form.city,
      phone: form.phone,
      website: form.website,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingProfile) {
      result = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', existingProfile.id);
    } else {
      result = await supabase
        .from('profiles')
        .insert({ ...payload, created_at: new Date().toISOString() });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess('Profil enregistré avec succès !');
      setExistingProfile({ ...existingProfile, ...payload });
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">
        {existingProfile ? 'Modifier mon profil' : 'Créer mon profil boutique'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Nom de la boutique *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Catégorie
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              <option value="">Sélectionnez...</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Ville
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Adresse
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Téléphone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Site web
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {loading
            ? 'Enregistrement...'
            : existingProfile
              ? 'Mettre à jour'
              : 'Créer le profil'}
        </button>
      </form>
    </div>
  );
}
