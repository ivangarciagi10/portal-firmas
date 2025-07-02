"use client";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsuarios: "-", totalProyectos: "-", totalFirmas: "-" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center">
          <span className="text-4xl mb-2">👤</span>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsuarios}</div>
          <div className="text-gray-600">Usuarios registrados</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center">
          <span className="text-4xl mb-2">📁</span>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalProyectos}</div>
          <div className="text-gray-600">Proyectos</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center">
          <span className="text-4xl mb-2">✍️</span>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalFirmas}</div>
          <div className="text-gray-600">Firmas totales</div>
        </div>
      </div>
      {/* Aquí irán las gráficas de actividad */}
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Actividad reciente</h2>
        <div className="text-gray-500">(Próximamente: gráficas y logs de actividad)</div>
      </div>
    </div>
  );
} 