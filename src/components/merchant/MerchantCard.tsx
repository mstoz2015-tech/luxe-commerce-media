import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface Merchant {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  city: string | null;
  logo_url: string | null;
}

export function MerchantCard({ merchant }: { merchant: Merchant }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl">
          {merchant.logo_url ? (
            <img
              src={merchant.logo_url}
              alt={merchant.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            '🏪'
          )}
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900">{merchant.name}</h3>
          {merchant.city && (
            <p className="text-xs text-zinc-500">{merchant.city}</p>
          )}
        </div>
      </div>
      {merchant.description && (
        <p className="line-clamp-2 text-sm text-zinc-600">
          {merchant.description}
        </p>
      )}
      {merchant.category && (
        <span className="mt-3 inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
          {merchant.category}
        </span>
      )}
    </div>
  );
}
