"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProject(data);
          setLoading(false);
        });
    }
  }, [status, projectId]);

  const handleSign = async (signatureId) => {
    setSigning(true);
    setError("");
    const res = await fetch(`/api/signatures/${signatureId}`, {
      method: "POST",
    });
    if (res.ok) {
      setSigned(true);
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => setProject(data));
    } else {
      setError("Error al firmar");
    }
    setSigning(false);
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied("") , 1500);
  };

  if (status === "loading" || loading) return <div className="p-8">Cargando proyecto...</div>;
  if (!session || !project) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">{project.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="mb-2"><b>Tipo:</b> {project.type}</p>
          <p className="mb-2"><b>Cliente/Empresa:</b> {project.clientCompany}</p>
          <p className="mb-2"><b>Usuario clave:</b> {project.keyUser}</p>
        </div>
        <div>
          <p className="mb-2"><b>Inicio:</b> {project.startDate?.slice(0,10)}</p>
          <p className="mb-2"><b>Entrega planificada:</b> {project.plannedEndDate?.slice(0,10)}</p>
          <p className="mb-2"><b>Cierre real:</b> {project.realEndDate?.slice(0,10) || '-'}</p>
        </div>
      </div>
      <p className="mb-2"><b>Alcance y objetivos:</b> {project.scopeObjectives}</p>
      <p className="mb-2"><b>Comentarios:</b> {project.comments || '-'}</p>
      <h2 className="text-xl font-semibold mt-8 mb-2 text-gray-700">Firmas</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acción</th>
              <th className="p-2 border">Enlace de firma</th>
              {session.user.role === 'ADMIN' && <th className="p-2 border">Comentarios / Calificación</th>}
            </tr>
          </thead>
          <tbody>
            {project.signatures.map(sig => (
              <tr key={sig.id} className="hover:bg-blue-50 transition">
                <td className="p-2 border font-medium">{sig.name}</td>
                <td className="p-2 border">{sig.role}</td>
                <td className="p-2 border">
                  {sig.estado === 'REJECTED' ? (
                    <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Rechazado</span>
                  ) : sig.signedAt ? (
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Firmado el {sig.signedAt.slice(0,10)}</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Pendiente</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {(!sig.signedAt && session.user.id === sig.userId) && (
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold shadow"
                      onClick={() => handleSign(sig.id)}
                      disabled={signing || signed}
                    >
                      Firmar
                    </button>
                  )}
                  {(sig.signedAt || session.user.id !== sig.userId) && (
                    <span>-</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {sig.token ? (
                    <div className="flex items-center gap-2 justify-center">
                      <a
                        href={`/sign/${sig.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-xs break-all"
                      >
                        /sign/{sig.token}
                      </a>
                      <button
                        className={`px-2 py-1 rounded text-xs font-semibold ${copied === sig.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        onClick={() => handleCopy(`${window.location.origin}/sign/${sig.token}`, sig.id)}
                      >
                        {copied === sig.id ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No aplica</span>
                  )}
                </td>
                {session.user.role === 'ADMIN' && (
                  <td className="p-2 border text-xs">
                    {sig.estado === 'REJECTED' && (
                      <div>
                        <b>Motivo rechazo:</b> {sig.motivoRechazo || '-'}<br/>
                        <b>Comentario:</b> {sig.comentario || '-'}
                      </div>
                    )}
                    {sig.estado === 'ACCEPTED' && (
                      <div>
                        <b>Comentario:</b> {sig.comentario || '-'}<br/>
                        <b>Calificación general:</b> {sig.calificacionGeneral || '-'}<br/>
                        <b>Calidad desarrollo:</b> {sig.calidadDesarrollo || '-'}<br/>
                        <b>Comunicación:</b> {sig.comunicacion || '-'}<br/>
                        <b>Cumplimiento tiempos:</b> {sig.cumplimientoTiempos || '-'}<br/>
                        <b>Recomendación:</b> {sig.recomendacion || '-'}<br/>
                        <b>Feedback:</b> {sig.feedback || '-'}
                      </div>
                    )}
                    {sig.estado !== 'REJECTED' && sig.estado !== 'ACCEPTED' && (
                      <span>-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {signed && <div className="text-green-600 mb-2">¡Firma registrada!</div>}
    </div>
  );
} 