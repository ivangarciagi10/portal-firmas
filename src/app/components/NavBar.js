"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-4">
          <Image src="/logo-gi.png" alt="Generando Ideas" width={160} height={40} priority className="h-10 w-auto" />
          {session && (
            <>
              <a href="/" className="text-secondary hover:text-primary transition text-lg font-semibold hidden md:inline">Dashboard</a>
              <a href="/projects" className="text-secondary hover:text-primary transition text-lg font-semibold hidden md:inline">Proyectos</a>
            </>
          )}
        </div>
        {session && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-orange-700 hover:shadow-lg transition text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  );
} 