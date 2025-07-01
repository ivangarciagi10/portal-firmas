import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Permitir acceso público a las páginas de firma
    if (req.nextUrl.pathname.startsWith("/sign/")) {
      return NextResponse.next();
    }
    
    // Para otras rutas, verificar autenticación
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso público a las páginas de firma
        if (req.nextUrl.pathname.startsWith("/sign/")) {
          return true;
        }
        
        // Para otras rutas, requerir autenticación
        return !!token;
      },
    },
  }
);

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