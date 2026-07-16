import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege apenas a raiz / (painel admin)
  if (pathname === '/') {
    const session = request.cookies.get('admin_session');
    if (session?.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', '/');
      return NextResponse.redirect(loginUrl);
    }
  }

  // /admin e /admin/* redirecionam para a raiz
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // /login: se já autenticado, vai direto pra raiz
  if (pathname === '/login') {
    const session = request.cookies.get('admin_session');
    if (session?.value === 'authenticated') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin', '/admin/:path*'],
};
