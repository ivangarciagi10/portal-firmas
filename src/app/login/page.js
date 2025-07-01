"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    if (res?.error) setError("Credenciales incorrectas");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h1>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded mb-4 hover:bg-blue-600"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Iniciar sesión con Google
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400">o</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
} 