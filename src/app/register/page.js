"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Registro exitoso. Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setError(data.error || "Error al registrar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded mb-4"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <label className="block mb-2 text-sm font-medium">Correo electrónico</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded mb-4"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label className="block mb-2 text-sm font-medium">Contraseña</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded mb-4"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {success && <div className="text-green-600 mb-2">{success}</div>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
} 