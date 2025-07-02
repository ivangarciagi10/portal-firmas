"use client"
import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Usuarios</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 md:items-center">
        <input type="text" placeholder="Buscar usuario..." className="border p-2 rounded w-full md:w-64" />
        <select className="border p-2 rounded w-full md:w-48">
          <option value="">Todos los roles</option>
          <option value="ADMIN">Admin</option>
          <option value="GESTOR">Gestor</option>
          <option value="FIRMANTE">Firmante</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Correo</th>
              <th className="py-2 px-4 text-left">Rol</th>
              <th className="py-2 px-4 text-left">Estado</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Sin usuarios</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="py-2 px-4">{user.name || '-'}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">
                    {user.active === false ? (
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Inactivo</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Activo</span>
                    )}
                  </td>
                  <td className="py-2 px-4">-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 