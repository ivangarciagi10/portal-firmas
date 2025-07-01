import { NextResponse } from "next/server";

export function middleware(req) {
  // Permitir acceso público a las páginas de firma sin verificar autenticación
  if (req.nextUrl.pathname.startsWith("/sign/")) {
    return NextResponse.next();
  }
  
  // Para otras rutas, verificar autenticación usando NextAuth
  const token = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");
  
  if (!token) {
    // Redirigir a login solo si no es una ruta de firma
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 