import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // Get merchant profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-5xl">🏪</div>
        <h2 className="mb-2 text-xl font-semibold text-zinc-900">
          Bienvenue sur votre tableau de bord !
        </h2>
        <p className="mb-6 text-zinc-500">
          Créez d&apos;abord votre profil boutique pour commencer à publier.
        </p>
        <Link
          href={`/${locale}/dashboard/profile`}
          className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Créer mon profil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {profile.name}
          </h1>
          <p className="text-zinc-500">{profile.category || 'Sans catégorie'}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/posts/new`}
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Nouvelle publication
        </Link>
      </div>

      {/* Posts list */}
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <div
              key={post.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {post.post_type}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(post.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h3 className="font-semibold text-zinc-900">{post.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                {post.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
          <p className="text-zinc-500">
            Vous n&apos;avez pas encore de publications. Créez votre première publication !
          </p>
        </div>
      )}
    </div>
  );
}
