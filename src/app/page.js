"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, signed: 0, pending: 0, months: [], counts: [] });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Redirigir a clientes a /projects
    if (status === "authenticated" && session?.user?.role === "CLIENT") {
      router.replace("/projects");
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "CLIENT") {
      fetch("/api/projects")
        .then(res => res.json())
        .then(data => {
          // Estadísticas para gráficas
          let total = 0, signed = 0, pending = 0;
          const months = {};
          data.forEach(p => {
            if (p.startDate) {
              const m = new Date(p.startDate).toLocaleString("es-MX", { month: "short", year: "2-digit" });
              months[m] = (months[m] || 0) + 1;
            }
            if (p.signatures) {
              p.signatures.forEach(sig => {
                total++;
                if (sig.signedAt) signed++; else pending++;
              });
            }
          });
          setStats({
            total,
            signed,
            pending,
            months: Object.keys(months),
            counts: Object.values(months),
          });
          setProjects(data);
        });
    }
  }, [status, session]);

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session || session.user.role === "CLIENT") return null;
  const { user } = session;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Bienvenido, {user.name || user.email}</h1>
      <p className="mb-8 text-gray-600">Rol: <span className="font-semibold text-blue-700">{user.role}</span></p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Proyectos creados por mes</h2>
          <Bar
            data={{
              labels: stats.months,
              datasets: [
                {
                  label: "Proyectos",
                  data: stats.counts,
                  backgroundColor: "#2563eb",
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
            }}
            height={200}
          />
        </div>
        <div className="bg-gray-50 rounded-lg p-6 shadow-inner flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Estado de firmas</h2>
          <Doughnut
            data={{
              labels: ["Firmadas", "Pendientes"],
              datasets: [
                {
                  data: [stats.signed, stats.pending],
                  backgroundColor: ["#22c55e", "#fbbf24"],
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              cutout: "70%",
              plugins: { legend: { position: "bottom" } },
            }}
            width={200}
            height={200}
          />
          <div className="mt-4 flex gap-6 text-sm">
            <span className="inline-block px-3 py-1 rounded bg-green-100 text-green-700 font-semibold">Firmadas: {stats.signed}</span>
            <span className="inline-block px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Pendientes: {stats.pending}</span>
          </div>
        </div>
      </div>
      {/* Estadísticas de satisfacción solo para admin */}
      {user.role === 'ADMIN' && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
              </svg>
            </div>
            Reseñas y Satisfacción de Clientes
          </h2>
          
          {(() => {
            const allSignatures = projects.flatMap(p => p.signatures || []);
            const accepted = allSignatures.filter(sig => sig.estado === 'ACCEPTED');
            
            if (accepted.length === 0) {
              return (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin reseñas aún</h3>
                  <p className="text-gray-600">Las reseñas de clientes aparecerán aquí cuando completen los cuestionarios</p>
                </div>
              );
            }

            const avg = arr => arr.length ? (arr.reduce((a, b) => a + (b || 0), 0) / arr.length) : 0;
            const promGeneral = avg(accepted.map(sig => sig.calificacionGeneral));
            
            // Calcular estadísticas por categoría
            const categorias = [
              { key: 'calificacionGeneral', label: 'Experiencia General', icon: '⭐' },
              { key: 'calidadDesarrollo', label: 'Calidad del Desarrollo', icon: '💻' },
              { key: 'comunicacion', label: 'Comunicación', icon: '💬' },
              { key: 'cumplimientoTiempos', label: 'Cumplimiento de Tiempos', icon: '⏰' },
              { key: 'recomendacion', label: 'Recomendación', icon: '👍' }
            ];

            const stats = categorias.map(cat => ({
              ...cat,
              promedio: avg(accepted.map(sig => sig[cat.key]).filter(Boolean))
            }));

            // Obtener comentarios recientes
            const comentariosRecientes = accepted
              .filter(sig => sig.comentario || sig.feedback)
              .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt))
              .slice(0, 3);

            return (
              <div className="space-y-6">
                {/* Métricas principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Promedio general destacado */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">⭐</div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {promGeneral ? promGeneral.toFixed(1) : '-'}
                      </div>
                      <div className="text-sm text-gray-600">Promedio General</div>
                      <div className="flex justify-center mt-2">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className={`w-5 h-5 ${i <= Math.round(promGeneral) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Total de reseñas */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📝</div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">{accepted.length}</div>
                      <div className="text-sm text-gray-600">Reseñas Recibidas</div>
                    </div>
                  </div>

                  {/* Satisfacción */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">😊</div>
                      <div className="text-3xl font-bold text-gray-800 mb-1">
                        {promGeneral >= 4 ? 'Excelente' : promGeneral >= 3 ? 'Buena' : 'Regular'}
                      </div>
                      <div className="text-sm text-gray-600">Nivel de Satisfacción</div>
                    </div>
                  </div>
                </div>

                {/* Detalle por categorías */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle por Categorías</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-lg font-bold text-gray-800">
                          {stat.promedio ? stat.promedio.toFixed(1) : '-'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                        <div className="flex justify-center mt-2">
                          {[1,2,3,4,5].map(i => (
                            <svg key={i} className={`w-3 h-3 ${i <= Math.round(stat.promedio) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comentarios recientes */}
                {comentariosRecientes.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Comentarios Recientes</h3>
                    <div className="space-y-4">
                      {comentariosRecientes.map((sig, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 font-semibold text-sm">
                                  {sig.name ? sig.name.charAt(0).toUpperCase() : 'C'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-800">{sig.name || 'Cliente'}</span>
                            </div>
                            <div className="flex">
                              {[1,2,3,4,5].map(i => (
                                <svg key={i} className={`w-4 h-4 ${i <= (sig.calificacionGeneral || 0) ? 'text-orange-500' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                          {(sig.comentario || sig.feedback) && (
                            <p className="text-gray-700 text-sm italic">
                              &quot;{sig.comentario || sig.feedback}&quot;
                            </p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {sig.signedAt ? new Date(sig.signedAt).toLocaleDateString('es-ES') : 'Fecha no disponible'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
      {/* Paneles según rol */}
      {user.role === "ADMIN" && (
        <div className="bg-blue-50 rounded-lg p-6 shadow-inner mt-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Panel de Administrador</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Crear y gestionar proyectos</li>
            <li>Asignar clientes e invitados</li>
            <li>Ver estado de firmas</li>
          </ul>
        </div>
      )}
      {user.role === "CLIENT" && (
        <div className="bg-blue-50 rounded-lg p-6 shadow-inner mt-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Panel de Cliente</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Ver tus proyectos</li>
            <li>Firmar documentos asignados</li>
            <li>Ver estado de tus firmas</li>
          </ul>
        </div>
      )}
      {user.role === "GUEST" && (
        <div className="bg-blue-50 rounded-lg p-6 shadow-inner mt-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Panel de Invitado</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Firmar documento asignado</li>
          </ul>
        </div>
      )}
    </div>
  );
}
