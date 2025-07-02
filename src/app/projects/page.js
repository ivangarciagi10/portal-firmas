"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

function EditProjectModal({ open, onClose, project, onSave }) {
  const [form, setForm] = useState(project || {});
  const [signatures, setSignatures] = useState(project?.signatures ? project.signatures.map(sig => ({ ...sig })) : []);
  useEffect(() => {
    setForm(project || {});
    setSignatures(project?.signatures ? project.signatures.map(sig => ({ ...sig })) : []);
  }, [project]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSignatureChange = (idx, e) => {
    const newSignatures = [...signatures];
    newSignatures[idx][e.target.name] = e.target.value;
    setSignatures(newSignatures);
  };
  const addSignature = () => setSignatures([...signatures, { name: "", email: "", role: "" }]);
  const removeSignature = idx => setSignatures(signatures.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    await onSave({ ...form, signatures });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-4 w-[70vw] max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Editar proyecto</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre del proyecto</label>
            <input name="name" value={form.name || ""} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tipo de proyecto</label>
            <select
              name="type"
              value={form.type || ""}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="Página Web">Página Web</option>
              <option value="Cotizador por API">Cotizador por API</option>
              <option value="Tienda en Línea">Tienda en Línea</option>
              <option value="Tienda Fullfilment">Tienda Fullfilment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Cliente / Empresa</label>
            <input name="clientCompany" value={form.clientCompany || ""} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Usuario clave</label>
            <input name="keyUser" value={form.keyUser || ""} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de inicio</label>
            <input name="startDate" value={form.startDate?.slice(0,10) || ""} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de entrega planificada</label>
            <input name="plannedEndDate" value={form.plannedEndDate?.slice(0,10) || ""} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de cierre real</label>
            <input name="realEndDate" value={form.realEndDate?.slice(0,10) || ""} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Alcance y objetivos</label>
            <textarea name="scopeObjectives" value={form.scopeObjectives || ""} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Comentarios y observaciones</label>
            <textarea name="comments" value={form.comments || ""} onChange={handleChange} className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2 mt-6">
            <label className="block text-base font-bold mb-2 text-blue-700">Firmantes invitados</label>
            {signatures.map((sig, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2 items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                <input
                  name="name"
                  value={sig.name}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Nombre completo"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  name="email"
                  value={sig.email}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Correo electrónico"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  name="role"
                  value={sig.role}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Rol (ej: Cliente, Subdirector)"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                {signatures.length > 1 && (
                  <button type="button" onClick={() => removeSignature(idx)} className="text-red-500 hover:text-red-700 font-bold text-lg ml-2">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSignature} className="mt-2 bg-blue-100 text-blue-700 px-4 py-1 rounded font-semibold hover:bg-blue-200 transition">+ Agregar firmante</button>
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userInputRef = useRef();
  const [form, setForm] = useState({
    name: "",
    type: "",
    clientCompany: "",
    keyUser: "",
    startDate: "",
    plannedEndDate: "",
    realEndDate: "",
    scopeObjectives: "",
    comments: "",
    ownerId: "",
  });
  const [signatures, setSignatures] = useState([
    { name: "", email: "", role: "" }
  ]);
  const [filter, setFilter] = useState({ name: "", status: "", date: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
    }
  }, [status]);

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

  if (status === "loading") return <div className="p-8">Cargando...</div>;
  if (!session) return null;

  // Si es cliente, solo mostrar sus proyectos y firmas
  if (session.user.role === "CLIENT") {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mis Proyectos</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left">Nombre</th>
                <th className="py-2 px-4 text-left">Cliente</th>
                <th className="py-2 px-4 text-left">Estado</th>
                <th className="py-2 px-4 text-left">Firmas</th>
                <th className="py-2 px-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">Cargando...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">Sin proyectos asignados</td></tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id}>
                    <td className="py-2 px-4 font-semibold">{project.name}</td>
                    <td className="py-2 px-4">{project.clientCompany}</td>
                    <td className="py-2 px-4">
                      {project.signatures && project.signatures.length > 0 && project.signatures.every(sig => sig.signedAt) ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Firmado</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Pendiente de firma</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col gap-1">
                        {project.signatures.map(sig => (
                          <div key={sig.id} className="text-xs">
                            <span className="font-medium">{sig.name}:</span> {sig.signedAt ? (
                              <span className="text-green-700">Firmado</span>
                            ) : (
                              <span className="text-yellow-700">Pendiente</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold shadow"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignatureChange = (idx, e) => {
    const newSignatures = [...signatures];
    newSignatures[idx][e.target.name] = e.target.value;
    setSignatures(newSignatures);
  };

  const addSignature = () => {
    setSignatures([...signatures, { name: "", email: "", role: "" }]);
  };

  const removeSignature = idx => {
    setSignatures(signatures.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    let ownerIdToSend = form.ownerId;
    if (ownerIdToSend === "") ownerIdToSend = null;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ownerId: ownerIdToSend, signatures }),
    });
    if (res.ok) {
      setForm({
        name: "",
        type: "",
        clientCompany: "",
        keyUser: "",
        startDate: "",
        plannedEndDate: "",
        realEndDate: "",
        scopeObjectives: "",
        comments: "",
        ownerId: "",
      });
      setSignatures([{ name: "", email: "", role: "" }]);
      setShowCreateForm(false);
      fetchProjects();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear proyecto");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas borrar este proyecto?")) return;
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== id));
    } else {
      alert("Error al borrar proyecto");
    }
  };

  // Filtros
  const filteredProjects = projects.filter(p => {
    const matchName = filter.name === "" || p.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchDate = filter.date === "" || (p.startDate && p.startDate.slice(0,10) === filter.date);
    let matchStatus = true;
    if (filter.status === "firmados") {
      matchStatus = p.signatures && p.signatures.length > 0 && p.signatures.every(sig => sig.signedAt);
    } else if (filter.status === "pendientes") {
      matchStatus = p.signatures && p.signatures.some(sig => !sig.signedAt);
    }
    return matchName && matchDate && matchStatus;
  });

  const openEditModal = project => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedProject(null);
    setEditModalOpen(false);
  };

  const saveEdit = async project => {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      closeEditModal();
      fetchProjects();
    } else {
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || "Error desconocido" };
      }
      setError(data.error || "Error al actualizar proyecto");
    }
  };

  // Al seleccionar usuario clave
  const handleUserSelect = user => {
    setForm(f => ({
      ...f,
      keyUser: user.name,
      clientCompany: user.empresa || f.clientCompany,
      ownerId: user.id
    }));
    setSignatures(sigs => [
      {
        name: user.name,
        email: user.email,
        role: user.puesto || "Usuario clave"
      },
      ...sigs.filter(sig => sig.email !== user.email)
    ]);
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

  return (
    <div className="w-[90%] mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Proyectos</h1>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
          value={filter.name}
          onChange={e => setFilter({ ...filter, name: e.target.value })}
        />
        <select
          className="border border-gray-300 p-2 rounded w-full md:w-1/4 focus:ring-2 focus:ring-blue-400"
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">Todos</option>
          <option value="firmados">Solo firmados</option>
          <option value="pendientes">Con firmas pendientes</option>
        </select>
        <input
          type="date"
          className="border border-gray-300 p-2 rounded w-full md:w-1/4 focus:ring-2 focus:ring-blue-400"
          value={filter.date}
          onChange={e => setFilter({ ...filter, date: e.target.value })}
        />
      </div>
      {/* Botón para mostrar/ocultar formulario de creación */}
      {session.user.role === "ADMIN" && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateForm(v => !v)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            {showCreateForm ? "Cancelar" : "Crear nuevo proyecto"}
          </button>
        </div>
      )}
      {/* Formulario de creación de proyecto */}
      {session.user.role === "ADMIN" && showCreateForm && (
        <form onSubmit={handleSubmit} className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow-inner">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre del proyecto</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Ej: Página Web Edulingua" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Tipo de proyecto</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Selecciona un tipo</option>
              <option value="Página Web">Página Web</option>
              <option value="Cotizador por API">Cotizador por API</option>
              <option value="Tienda en Línea">Tienda en Línea</option>
              <option value="Tienda Fullfilment">Tienda Fullfilment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Cliente / Empresa</label>
            <input name="clientCompany" value={form.clientCompany} onChange={handleChange} placeholder="Ej: Edulingua" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Usuario clave (responsable de validación)</label>
            <div className="relative">
              <input
                ref={userInputRef}
                type="text"
                name="keyUser"
                value={userQuery || form.keyUser}
                onChange={handleUserInput}
                onFocus={() => setShowUserDropdown(true)}
                onBlur={handleUserBlur}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                placeholder="Buscar por nombre o correo..."
                autoComplete="off"
                required
              />
              {showUserDropdown && userResults.length > 0 && (
                <div className="absolute bg-white border rounded shadow w-full z-50 max-h-48 overflow-y-auto">
                  {[{ id: null, name: "Cliente General", email: "" }, ...userResults.filter(u => u.name !== "Cliente General")].map(user => (
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
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de inicio</label>
            <input name="startDate" value={form.startDate} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de entrega planificada</label>
            <input name="plannedEndDate" value={form.plannedEndDate} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Fecha de cierre real</label>
            <input name="realEndDate" value={form.realEndDate} onChange={handleChange} type="date" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Alcance y objetivos</label>
            <textarea name="scopeObjectives" value={form.scopeObjectives} onChange={handleChange} placeholder="Describe el alcance y los objetivos del proyecto" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Comentarios y observaciones</label>
            <textarea name="comments" value={form.comments} onChange={handleChange} placeholder="Agrega comentarios adicionales" className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="md:col-span-2 mt-6">
            <label className="block text-base font-bold mb-2 text-blue-700">Firmantes invitados</label>
            {signatures.map((sig, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2 items-center bg-white p-3 rounded shadow-sm border border-gray-200">
                <input
                  name="name"
                  value={sig.name}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Nombre completo"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  name="email"
                  value={sig.email}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Correo electrónico"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                <input
                  name="role"
                  value={sig.role}
                  onChange={e => handleSignatureChange(idx, e)}
                  placeholder="Rol (ej: Cliente, Subdirector)"
                  className="border border-gray-300 p-2 rounded w-full md:w-1/3 focus:ring-2 focus:ring-blue-400"
                  required
                />
                {signatures.length > 1 && (
                  <button type="button" onClick={() => removeSignature(idx)} className="text-red-500 hover:text-red-700 font-bold text-lg ml-2">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addSignature} className="mt-2 bg-blue-100 text-blue-700 px-4 py-1 rounded font-semibold hover:bg-blue-200 transition">+ Agregar firmante</button>
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Crear proyecto</button>
          </div>
          {error && <div className="md:col-span-2 text-red-500 text-center font-semibold">{error}</div>}
        </form>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-3 border">Nombre</th>
              <th className="p-3 border">Tipo</th>
              <th className="p-3 border">Cliente</th>
              <th className="p-3 border">Usuario clave</th>
              <th className="p-3 border">Inicio</th>
              <th className="p-3 border">Entrega planificada</th>
              <th className="p-3 border">Cierre real</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id} className="hover:bg-blue-50 transition">
                <td className="p-2 border font-medium">{p.name}</td>
                <td className="p-2 border">{p.type}</td>
                <td className="p-2 border">{p.clientCompany}</td>
                <td className="p-2 border">{p.keyUser}</td>
                <td className="p-2 border">{p.startDate?.slice(0,10)}</td>
                <td className="p-2 border">{p.plannedEndDate?.slice(0,10)}</td>
                <td className="p-2 border">{p.realEndDate?.slice(0,10) || '-'}</td>
                <td className="p-2 border text-center flex flex-col gap-2 md:flex-row md:gap-2 justify-center items-center">
                  <button onClick={() => router.push(`/projects/${p.id}`)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-semibold shadow">Ver detalle</button>
                  <button onClick={() => openEditModal(p)} className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm font-semibold shadow">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-semibold shadow">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedProject && (
        <EditProjectModal
          open={editModalOpen}
          onClose={closeEditModal}
          project={selectedProject}
          onSave={saveEdit}
        />
      )}
    </div>
  );
} 