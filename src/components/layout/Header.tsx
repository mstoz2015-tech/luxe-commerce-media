'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { Menu, X, User, LogOut, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { LocaleSwitcher } from './LocaleSwitcher';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="text-lg font-bold tracking-tight text-zinc-900"
        >
          🏪 {t('siteName')}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href={`/${locale}`}
            className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            {t('home')}
          </Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link
                    href={`/${locale}/dashboard`}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-sm text-zinc-500 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={`/${locale}/login`}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm text-white hover:bg-zinc-700 transition-colors"
                  >
                    {t('register')}
                  </Link>
                </>
              )}
            </>
          )}

          <LocaleSwitcher />
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-zinc-600"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href={`/${locale}`}
              className="text-sm text-zinc-700"
              onClick={() => setMobileOpen(false)}
            >
              {t('home')}
            </Link>
            {user ? (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-zinc-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('dashboard')}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="text-sm text-red-600 text-left"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/login`}
                  className="text-sm text-zinc-700"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="text-sm font-medium text-zinc-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('register')}
                </Link>
              </>
            )}
            <LocaleSwitcher />
          </nav>
        </div>
      )}
    </header>
  );
}
