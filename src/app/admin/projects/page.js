"use client"
import { useEffect, useState, useRef } from "react";

function ProjectDetailModal({ project, onClose }) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">{project.name}</h2>
        <div className="mb-2 text-gray-700"><b>Cliente:</b> {project.clientCompany}</div>
        <div className="mb-2 text-gray-700"><b>Responsable:</b> {project.owner?.name || project.keyUser || '-'}</div>
        <div className="mb-2 text-gray-700"><b>Fecha inicio:</b> {project.startDate?.slice(0,10) || '-'}</div>
        <div className="mb-2 text-gray-700"><b>Fecha entrega planificada:</b> {project.plannedEndDate?.slice(0,10) || '-'}</div>
        <div className="mb-2 text-gray-700"><b>Fecha cierre real:</b> {project.realEndDate?.slice(0,10) || '-'}</div>
        <div className="mb-2 text-gray-700"><b>Estado:</b> {project.status || (project.realEndDate ? 'Cerrado' : 'Activo')}</div>
        <div className="mb-4 text-gray-700"><b>Firmantes:</b></div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white rounded shadow border border-gray-100 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-1 px-2 text-left">Nombre</th>
                <th className="py-1 px-2 text-left">Rol</th>
                <th className="py-1 px-2 text-left">Correo</th>
                <th className="py-1 px-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {project.signatures.map(sig => (
                <tr key={sig.id}>
                  <td className="py-1 px-2">{sig.name}</td>
                  <td className="py-1 px-2">{sig.role}</td>
                  <td className="py-1 px-2">{sig.email}</td>
                  <td className="py-1 px-2">
                    {sig.estado === 'REJECTED' ? (
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Rechazado</span>
                    ) : sig.signedAt ? (
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Firmado</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-gray-700"><b>Comentarios:</b> {project.comments || '-'}</div>
      </div>
    </div>
  );
}

function EditProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || {});
  const [clients, setClients] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userInputRef = useRef();

  useEffect(() => { setForm(project || {}); }, [project]);
  useEffect(() => {
    fetch("/api/admin/clients")
      .then(res => res.json())
      .then(data => setClients(data));
  }, []);

  // Buscar usuarios para autocompletado
  useEffect(() => {
    if (userQuery.length < 2) {
      setUserResults([]);
      return;
    }
    fetch(`/api/admin/users?q=${encodeURIComponent(userQuery)}`)
      .then(res => res.json())
      .then(data => setUserResults(data));
  }, [userQuery]);

  if (!project) return null;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleClientChange = e => setForm({ ...form, ownerId: e.target.value === "general" ? null : e.target.value });

  // Al seleccionar usuario clave
  const handleUserSelect = user => {
    setForm(f => ({
      ...f,
      keyUser: user.name,
      clientCompany: user.empresa || f.clientCompany,
      // Agregar como primer firmante si no existe
      signatures: [
        {
          name: user.name,
          email: user.email,
          role: user.puesto || "Usuario clave"
        },
        ...(f.signatures?.filter(sig => sig.email !== user.email) || [])
      ]
    }));
    setUserQuery(user.name + (user.email ? ` (${user.email})` : ""));
    setShowUserDropdown(false);
  };

  const handleUserInput = e => {
    setUserQuery(e.target.value);
    setShowUserDropdown(true);
  };

  const handleUserBlur = () => {
    setTimeout(() => setShowUserDropdown(false), 200);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Editar proyecto</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Usuario clave</label>
            <input
              ref={userInputRef}
              type="text"
              name="keyUser"
              value={userQuery || form.keyUser || ""}
              onChange={handleUserInput}
              onFocus={() => setShowUserDropdown(true)}
              onBlur={handleUserBlur}
              className="border p-2 rounded w-full"
              placeholder="Buscar por nombre o correo..."
              autoComplete="off"
            />
            {showUserDropdown && userResults.length > 0 && (
              <div className="absolute bg-white border rounded shadow w-full z-50 max-h-48 overflow-y-auto">
                {userResults.map(user => (
                  <div
                    key={user.id}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleUserSelect(user)}
                  >
                    {user.name} <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Cliente asignado</label>
            <select name="ownerId" value={form.ownerId || "general"} onChange={handleClientChange} className="border p-2 rounded w-full">
              <option value="general">Cliente General (no registrado)</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name || c.email}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre del proyecto</label>
            <input name="name" value={form.name || ''} onChange={handleChange} className="border p-2 rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Empresa</label>
            <input name="clientCompany" value={form.clientCompany || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha inicio</label>
            <input name="startDate" type="date" value={form.startDate?.slice(0,10) || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha entrega planificada</label>
            <input name="plannedEndDate" type="date" value={form.plannedEndDate?.slice(0,10) || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha cierre real</label>
            <input name="realEndDate" type="date" value={form.realEndDate?.slice(0,10) || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Comentarios</label>
            <textarea name="comments" value={form.comments || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  useEffect(() => {
    fetch("/api/admin/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proyecto?")) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id));
    } else {
      alert("Error al eliminar proyecto");
    }
  };

  const handleSave = async (form) => {
    const res = await fetch(`/api/projects`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setEditProject(null);
    } else {
      alert("Error al guardar cambios");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Proyectos</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 md:items-center">
        <input type="text" placeholder="Buscar proyecto..." className="border p-2 rounded w-full md:w-64" />
        <select className="border p-2 rounded w-full md:w-48">
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Cliente</th>
              <th className="py-2 px-4 text-left">Responsable</th>
              <th className="py-2 px-4 text-left">Estado</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Cargando...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-400">Sin proyectos</td></tr>
            ) : (
              projects.map(project => (
                <tr key={project.id}>
                  <td className="py-2 px-4">
                    <button className="text-blue-700 underline hover:text-blue-900" onClick={() => setSelectedProject(project)}>{project.name}</button>
                  </td>
                  <td className="py-2 px-4">{project.clientCompany}</td>
                  <td className="py-2 px-4">{project.owner?.name || project.keyUser || '-'}</td>
                  <td className="py-2 px-4">
                    {project.status || (project.realEndDate ? (
                      <span className="inline-block px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-semibold">Cerrado</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Activo</span>
                    ))}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-semibold" onClick={() => setEditProject(project)}>Editar</button>
                    <button className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold" onClick={() => handleDelete(project.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      <EditProjectModal project={editProject} onClose={() => setEditProject(null)} onSave={handleSave} />
    </div>
  );
} 