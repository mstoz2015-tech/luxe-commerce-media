import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-zinc-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
        <p>
          &copy; {new Date().getFullYear()} {t('siteName')} —{' '}
          {t('siteDescription')}
        </p>
      </div>
    </footer>
  );
}
