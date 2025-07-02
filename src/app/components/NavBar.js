"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isClient = session?.user?.role === "CLIENT";

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2">
        <div className="flex items-center gap-4">
          <Image src="/logo-gi.png" alt="Generando Ideas" width={160} height={40} priority className="h-10 w-auto" />
          {session && (
            <>
              {!isClient ? (
                <div className="hidden md:flex gap-4">
                  <Link href="/" className="text-secondary hover:text-primary transition text-lg font-semibold">Dashboard</Link>
                  <Link href="/projects" className="text-secondary hover:text-primary transition text-lg font-semibold">Proyectos</Link>
                </div>
              ) : (
                <div className="hidden md:flex gap-4">
                  <Link href="/projects" className="text-secondary hover:text-primary transition text-lg font-semibold">Mis Proyectos</Link>
                  <Link href="/profile" className="text-secondary hover:text-primary transition text-lg font-semibold">Mi Perfil</Link>
                </div>
              )}
              <button
                className="md:hidden flex items-center px-2 py-1 border rounded text-gray-700 border-gray-300 hover:bg-gray-100 ml-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </>
          )}
        </div>
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-orange-700 hover:shadow-lg transition text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hidden md:block"
          >
            Cerrar sesión
          </button>
        )}
      </div>
      {/* Menú móvil */}
      {menuOpen && session && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg px-4 py-2">
          {!isClient ? (
            <>
              <Link href="/" className="block py-2 text-secondary hover:text-primary font-semibold" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/projects" className="block py-2 text-secondary hover:text-primary font-semibold" onClick={() => setMenuOpen(false)}>Proyectos</Link>
            </>
          ) : (
            <>
              <Link href="/projects" className="block py-2 text-secondary hover:text-primary font-semibold" onClick={() => setMenuOpen(false)}>Mis Proyectos</Link>
              <Link href="/profile" className="block py-2 text-secondary hover:text-primary font-semibold" onClick={() => setMenuOpen(false)}>Mi Perfil</Link>
            </>
          )}
          <button
            onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }); }}
            className="w-full text-left py-2 text-orange-700 font-semibold hover:text-orange-900"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
} 