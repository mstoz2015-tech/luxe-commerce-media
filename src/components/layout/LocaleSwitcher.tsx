'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';

const localeLabels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
  lb: 'LU',
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Replace the locale segment in the pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-0.5">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === l
              ? 'bg-zinc-900 text-white'
              : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
