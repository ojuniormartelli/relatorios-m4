import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege /admin e todas as sub-rotas, exceto /admin/login
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Libera a página de login
    if (pathname === '/admin/login') {
      // Se já estiver autenticado, redireciona direto pro admin
      const session = request.cookies.get('admin_session');
      if (session?.value === 'authenticated') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Verifica se está autenticado
    const session = request.cookies.get('admin_session');
    if (session?.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      // Preserva a URL original pra redirecionar depois do login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
