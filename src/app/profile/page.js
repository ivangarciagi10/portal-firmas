"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    empresa: session?.user?.empresa || "",
    puesto: session?.user?.puesto || ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSuccess("Datos actualizados correctamente");
      update();
    } else {
      setError("Error al actualizar datos");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Correo electrónico</label>
          <input name="email" value={form.email} onChange={handleChange} className="border p-2 rounded w-full" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Empresa</label>
          <input name="empresa" value={form.empresa} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Puesto</label>
          <input name="puesto" value={form.puesto} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
} 