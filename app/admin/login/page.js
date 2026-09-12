"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Contraseña incorrecta");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl ring-1 ring-brand-blush-100"
      >
        <div className="mb-6 flex justify-center">
          <BrandLogo size="lg" />
        </div>
        <h1 className="mb-1 text-center text-lg font-bold text-brand-deep-900">
          Panel administrativo
        </h1>
        <p className="mb-6 text-center text-sm text-brand-deep-900/60">
          Ingresa la contraseña para gestionar tu tienda.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          autoFocus
          className="w-full rounded-full border border-brand-pink-200 px-5 py-3 text-sm outline-none focus:border-brand-plum-600"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-brand-plum-600 py-3 text-sm font-semibold text-white hover:bg-brand-plum-700 disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
