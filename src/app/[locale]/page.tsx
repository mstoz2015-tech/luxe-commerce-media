import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/server';
import { PostCard } from '@/components/merchant/PostCard';
import { MerchantCard } from '@/components/merchant/MerchantCard';

export default async function HomePage() {
  const t = useTranslations('home');
  const supabase = await createClient();

  // Fetch latest posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles(*)')
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch featured merchants
  const { data: merchants } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_featured', true)
    .limit(6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-500">
          {t('subtitle')}
        </p>
      </section>

      {/* Featured merchants */}
      {merchants && merchants.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-800">
            {t('featuredMerchants')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </section>
      )}

      {/* Latest posts */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold text-zinc-800">
          {t('latestPosts')}
        </h2>
        {posts && posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
            <p className="text-zinc-500">
              Aucune publication pour le moment. Soyez le premier commerçant à publier !
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
