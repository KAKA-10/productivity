import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, decodeAccessToken } from '@/lib/session';
import { isLocalAuthBypassEnabled } from '@/lib/local-auth-bypass';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (isLocalAuthBypassEnabled(request.headers.get('host'))) {
    const previewPage = pathname === '/app/osh-audit' ||
      pathname.startsWith('/app/osh-audit/') ||
      pathname === '/app/fire-safety-audit' ||
      pathname.startsWith('/app/fire-safety-audit/');
    const appRoute = pathname === '/app' || pathname.startsWith('/app/');
    if (appRoute && !previewPage) {
      return NextResponse.redirect(new URL('/app/fire-safety-audit', request.url));
    }
    return NextResponse.next();
  }

  const claims = decodeAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);

  if (pathname.startsWith('/app') && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${pathname}${search}`);
    if (request.cookies.has(REFRESH_COOKIE)) {
      url.searchParams.set('refresh', '1');
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/app/:path*', '/login'],
};
