import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, decodeAccessToken } from '@/lib/session';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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
  matcher: ['/app/:path*'],
};
