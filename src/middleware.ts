import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session
  const supabaseResponse = await updateSession(request);

  // 2. Handle i18n
  const intlResponse = await intlMiddleware(request);

  // Merge cookies from Supabase into i18n response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      ...cookie,
    });
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|api|static|.*\\..*|favicon.ico).*)',
  ],
};
