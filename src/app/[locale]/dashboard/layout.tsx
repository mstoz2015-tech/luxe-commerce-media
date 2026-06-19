import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Store, FileText, Settings } from 'lucide-react';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('common');
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Check if profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <FileText className="h-4 w-4" />
              {t('dashboard')}
            </Link>
            {profile ? (
              <>
                <Link
                  href={`/${locale}/dashboard/profile`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <Store className="h-4 w-4" />
                  {t('profile')}
                </Link>
                <Link
                  href={`/${locale}/dashboard/posts/new`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Nouvelle publication
                </Link>
              </>
            ) : (
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Créer mon profil
              </Link>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
