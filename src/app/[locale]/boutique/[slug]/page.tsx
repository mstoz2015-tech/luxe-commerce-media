'use client';

import { createClient } from '@/lib/supabase/client';
import { PostCard } from '@/components/merchant/PostCard';
import { MapPin, Phone, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BoutiquePage({
  params,
}: {
  params: { slug: string };
}) {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Fetch profile by slug
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (profileData) {
        setProfile(profileData);

        // Fetch posts for this profile
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('profile_id', profileData.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(20);

        setPosts(postsData || []);
      }

      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-zinc-500">Chargement...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900">
          Boutique introuvable
        </h1>
        <p className="text-zinc-500">
          Cette boutique n&apos;existe pas ou a été supprimée.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Profile header */}
      <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-3xl">
            {profile.logo_url ? (
              <img
                src={profile.logo_url}
                alt={profile.name}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              '🏪'
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              {profile.name}
            </h1>
            {profile.category && (
              <span className="mt-1 inline-block rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
                {profile.category}
              </span>
            )}
            {profile.description && (
              <p className="mt-3 text-sm text-zinc-600">
                {profile.description}
              </p>
            )}

            {/* Contact info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.city}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.phone}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-zinc-700 hover:text-zinc-900 underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Site web
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-zinc-800">
          Publications
        </h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={{ ...post, profiles: null }} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center">
            <p className="text-zinc-500">
              Aucune publication pour le moment.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
