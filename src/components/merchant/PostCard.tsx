import { getLocale } from 'next-intl/server';

const typeIcons: Record<string, string> = {
  promotion: '🏷️',
  event: '📅',
  job: '💼',
  news: '📰',
};

const typeColors: Record<string, string> = {
  promotion: 'bg-red-50 text-red-700',
  event: 'bg-blue-50 text-blue-700',
  job: 'bg-green-50 text-green-700',
  news: 'bg-zinc-50 text-zinc-700',
};

interface Post {
  id: string;
  title: string;
  content: string;
  post_type: string;
  created_at: string;
  profiles?: {
    name: string;
    logo_url: string | null;
  } | null;
}

export async function PostCard({ post }: { post: Post }) {
  const locale = await getLocale();

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Type badge */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            typeColors[post.post_type] || 'bg-zinc-50 text-zinc-700'
          }`}
        >
          {typeIcons[post.post_type] || '📌'} {post.post_type}
        </span>
        <time className="text-xs text-zinc-400">
          {new Date(post.created_at).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'short',
          })}
        </time>
      </div>

      {/* Content */}
      <h3 className="mb-2 font-semibold text-zinc-900">{post.title}</h3>
      <p className="line-clamp-3 text-sm text-zinc-600">{post.content}</p>

      {/* Merchant */}
      {post.profiles && (
        <div className="mt-4 flex items-center gap-2 border-t border-zinc-100 pt-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs">
            {post.profiles.logo_url ? (
              <img
                src={post.profiles.logo_url}
                alt={post.profiles.name}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              '🏪'
            )}
          </div>
          <span className="text-xs text-zinc-500">{post.profiles.name}</span>
        </div>
      )}
    </article>
  );
}
