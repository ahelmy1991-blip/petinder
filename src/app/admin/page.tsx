"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/admin", { headers: { "x-admin-key": key } });
    if (res.ok) {
      localStorage.setItem("admin-key", key);
      router.push("/admin/dashboard");
    } else {
      setError("Incorrect admin key. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-black text-white">Admin Access</h1>
          <p className="text-gray-500 text-sm mt-1">Petinder Operations Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900 rounded-2xl p-8 space-y-4 border border-gray-800">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Admin Key</label>
            <input
              type="password" required value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder-gray-600"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
            {loading ? "Verifying…" : "Enter Dashboard →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-700 mt-6">
          Restricted access · Petinder Admin v1.0
        </p>
      </div>
    </div>
  );
}
