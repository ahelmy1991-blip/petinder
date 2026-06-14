"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NEIGHBORHOODS = [
  "New Cairo","Maadi","Zamalek","Heliopolis","Nasr City",
  "Mohandiseen","Dokki","6th October","Sheikh Zayed","Giza","Katameya","Shubra",
];
const EMOJIS = ["🐾","🦮","🏡","🩺","✂️","🏨","🚗","🚨","🎓","🌿","🏃","🐕"];

type Mode = "choice" | "login" | "login-pw" | "register";

export default function MerchantPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choice");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", bio: "", avatarEmoji: "🐾",
    location: "", neighborhood: "New Cairo",
    whatsapp: "", email: "", password: "", confirmPassword: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  // Step 1: check email
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    const res = await fetch("/api/merchant/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.requiresPassword) {
        setPendingName(data.name);
        setMode("login-pw");
      } else {
        router.push(`/merchant/${data.merchantKey}`);
      }
    } else {
      setLoginError("No account found for that email. Try registering.");
    }
    setLoginLoading(false);
  };

  // Step 2: submit password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    const res = await fetch("/api/merchant/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    if (res.ok) {
      const { merchantKey } = await res.json();
      router.push(`/merchant/${merchantKey}`);
    } else {
      const d = await res.json();
      setLoginError(d.error ?? "Incorrect password.");
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setRegError("Passwords don't match."); return;
    }
    setRegLoading(true); setRegError("");
    const res = await fetch("/api/merchant/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        location: form.location || `${form.neighborhood}, Cairo`,
      }),
    });
    if (res.ok) {
      const { merchantKey } = await res.json();
      router.push(`/merchant/${merchantKey}`);
    } else {
      const d = await res.json();
      setRegError(d.error ?? "Registration failed. Try again.");
    }
    setRegLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🐾</div>
          <h1 className="text-3xl font-black text-gray-900">Merchant Portal</h1>
          <p className="text-gray-500 mt-1">Manage your pet services on Petinder Cairo</p>
        </div>

        {mode === "choice" && (
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-4">
            <button
              onClick={() => setMode("login")}
              className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl text-lg hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
            >
              🔑 Access My Dashboard
            </button>
            <button
              onClick={() => setMode("register")}
              className="w-full py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl text-lg hover:border-brand-300 hover:text-brand-600 transition-all flex items-center justify-center gap-2"
            >
              ✨ Join as a Service Provider
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">
              Free to join · No monthly fees · Pay-per-booking model
            </p>
          </div>
        )}

        {mode === "login" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <button onClick={() => setMode("choice")} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
            <h2 className="text-xl font-black text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your registered email to access your dashboard.</p>
            <form onSubmit={handleEmailCheck} className="space-y-4">
              <input
                type="email" required value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@business.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none text-sm transition-colors"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
                {loginLoading ? "Checking…" : "Continue →"}
              </button>
            </form>
          </div>
        )}

        {mode === "login-pw" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <button onClick={() => { setMode("login"); setLoginPassword(""); }} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
            <h2 className="text-xl font-black text-gray-900 mb-1">Hi, {pendingName}!</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your password to continue.</p>
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <input
                type="password" required value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none text-sm transition-colors"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors">
                {loginLoading ? "Logging in…" : "Access Dashboard →"}
              </button>
            </form>
          </div>
        )}

        {mode === "register" && (
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <button onClick={() => setMode("choice")} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
            <h2 className="text-xl font-black text-gray-900 mb-1">Create your provider profile</h2>
            <p className="text-gray-500 text-sm mb-6">Set up your account to manage your catalog and schedule.</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Business icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button"
                      onClick={() => setForm({ ...form, avatarEmoji: e })}
                      className={`w-10 h-10 text-2xl rounded-xl flex items-center justify-center transition-all ${
                        form.avatarEmoji === e ? "bg-brand-500 shadow-lg scale-110" : "bg-gray-100 hover:bg-gray-200"
                      }`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Business / Your name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Omar's Dog Walking"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Short bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={2} placeholder="Professional dog walker in Maadi since 2019…"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none resize-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp</label>
                  <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+201xxxxxxxxx"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Primary neighbourhood *</label>
                <select required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none bg-white transition-colors">
                  {NEIGHBORHOODS.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password (recommended)</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none transition-colors mb-2" />
                {form.password && (
                  <>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm password</label>
                    <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none transition-colors" />
                  </>
                )}
                <p className="text-xs text-gray-400 mt-1">Skip password to use your private dashboard link only</p>
              </div>

              {regError && <p className="text-red-500 text-sm">{regError}</p>}

              <button type="submit" disabled={regLoading}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors text-sm">
                {regLoading ? "Creating your profile…" : "Create Profile →"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Petinder Merchant Portal · Cairo Pet Marketplace
        </p>
      </div>
    </div>
  );
}
