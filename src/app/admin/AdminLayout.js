import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-orange-600">Admin</h2>
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="text-gray-700 font-semibold hover:text-orange-600">Dashboard</Link>
          <Link href="/admin/users" className="text-gray-700 font-semibold hover:text-orange-600">Usuarios</Link>
          <Link href="/admin/projects" className="text-gray-700 font-semibold hover:text-orange-600">Proyectos</Link>
          <Link href="/admin/auditoria" className="text-gray-700 font-semibold hover:text-orange-600">Auditoría</Link>
          <Link href="/admin/export" className="text-gray-700 font-semibold hover:text-orange-600">Exportar datos</Link>
        </nav>
      </aside>
      {/* Sidebar móvil */}
      <aside className="w-full bg-white border-b border-gray-200 flex md:hidden p-4 justify-between items-center">
        <h2 className="text-xl font-bold text-orange-600">Admin</h2>
        {/* Aquí podrías agregar un menú hamburguesa para navegación móvil */}
      </aside>
      {/* Contenido principal */}
      <main className="flex-1 p-4 md:p-10 overflow-x-auto">
        {children}
      </main>
    </div>
  );
} 