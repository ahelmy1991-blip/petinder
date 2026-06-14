"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "overview" | "providers" | "services" | "bookings" | "pets";

type AdminData = {
  stats: {
    totalPets: number; totalProviders: number; totalServices: number;
    totalBookings: number; totalSwipes: number; avgServicePrice: number; pendingRevenue: number;
  };
  recentBookings: Booking[];
  topPets: PetSummary[];
  allProviders: Provider[];
  allServices: Service[];
  allPets: Pet[];
  allBookings: Booking[];
};

type Provider = {
  id: string; name: string; avatarEmoji: string; neighborhood: string;
  email: string | null; whatsapp: string | null; rating: number;
  isVerified: boolean; isApproved: boolean; suspendedAt: string | null;
  merchantKey: string | null; createdAt: string;
  _count: { services: number; bookings: number };
};
type Service = {
  id: string; category: string; title: string; priceEGP: number;
  durationMins: number | null; isAvailable: boolean; atHomeOnly: boolean;
  provider: { name: string; neighborhood: string };
};
type Booking = {
  id: string; clientName: string; petName: string; clientPhone: string;
  status: string; scheduledAt: string; createdAt: string;
  service: { title: string; priceEGP: number; category: string };
  provider: { name: string; neighborhood: string };
};
type Pet = {
  id: string; name: string; breed: string; photoUrl: string;
  ageMonths: number; isAvailable: boolean; adoptedAt: string | null;
  location: string; shelterName: string;
  _count: { swipes: number };
};
type PetSummary = Pet;

const CAT_EMOJI: Record<string,string> = { walks:"🦮",sitting:"🏠",vets:"🩺",grooming:"✂️",hotel:"🏨",taxi:"🚗",emergency:"🚨" };
const STATUS_COLOR: Record<string,string> = {
  pending:"bg-yellow-100 text-yellow-700", confirmed:"bg-green-100 text-green-700",
  completed:"bg-blue-100 text-blue-700", cancelled:"bg-red-100 text-red-500",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{ entity: string; record: Record<string,unknown> } | null>(null);
  const [editFields, setEditFields] = useState<Record<string,string>>({});
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const adminKey = typeof window !== "undefined" ? localStorage.getItem("admin-key") ?? "" : "";

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin", { headers: { "x-admin-key": adminKey } });
    if (r.status === 401) { router.push("/admin"); return; }
    if (r.ok) setData(await r.json());
    setLoading(false);
  }, [adminKey, router]);

  useEffect(() => { load(); }, [load]);

  const override = async (entity: string, id: string, action: string, extra?: Record<string,unknown>) => {
    setActionLoading(true);
    const r = await fetch("/api/admin/override", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ entity, id, action, data: extra }),
    });
    if (r.ok) { await load(); showToast("Done ✓"); }
    else showToast("Error — check console");
    setActionLoading(false);
  };

  const openEdit = (entity: string, record: Record<string,unknown>) => {
    setEditModal({ entity, record });
    const fields: Record<string,string> = {};
    for (const [k,v] of Object.entries(record)) {
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        fields[k] = String(v);
      }
    }
    setEditFields(fields);
  };

  const submitEdit = async () => {
    if (!editModal) return;
    const rec = editModal.record as { id: string };
    const data: Record<string,unknown> = {};
    for (const [k,v] of Object.entries(editFields)) {
      if (v === "true") data[k] = true;
      else if (v === "false") data[k] = false;
      else if (!isNaN(Number(v)) && v !== "") data[k] = Number(v);
      else data[k] = v;
    }
    await override(editModal.entity, rec.id, "update", data);
    setEditModal(null);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center"><div className="text-5xl mb-3 animate-pulse">🔐</div><p className="text-gray-400">Loading admin data…</p></div>
      </div>
    );
  }

  const { stats } = data;
  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id:"overview",   label:"📊 Overview" },
    { id:"providers",  label:"🏪 Providers",  count: data.allProviders.length },
    { id:"services",   label:"🛎️ Services",   count: data.allServices.length },
    { id:"bookings",   label:"📅 Bookings",   count: data.allBookings.length },
    { id:"pets",       label:"🐾 Pets",       count: data.allPets.length },
  ];

  const q = search.toLowerCase();
  const filteredProviders = data.allProviders.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.neighborhood ?? "").toLowerCase().includes(q));
  const filteredServices  = data.allServices.filter((s) => !q || s.title.toLowerCase().includes(q) || s.provider.name.toLowerCase().includes(q));
  const filteredBookings  = data.allBookings.filter((b) => !q || b.clientName.toLowerCase().includes(q) || b.service.title.toLowerCase().includes(q) || b.provider.name.toLowerCase().includes(q));
  const filteredPets      = data.allPets.filter((p) => !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold shadow-2xl animate-pop-in">
          {toast}
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditModal(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-white mb-4 capitalize">Edit {editModal.entity}</h3>
            <div className="space-y-3">
              {Object.entries(editFields).filter(([k]) => !["id","createdAt","updatedAt","suspendedAt","adoptedAt","merchantKey"].includes(k)).map(([k, v]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-gray-400 block mb-1 capitalize">{k.replace(/([A-Z])/g, " $1")}</label>
                  {typeof (editModal.record as Record<string,unknown>)[k] === "boolean" ? (
                    <select value={v} onChange={(e) => setEditFields({...editFields,[k]:e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500">
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <input value={v} onChange={(e) => setEditFields({...editFields,[k]:e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 border border-gray-700 text-gray-400 font-semibold rounded-xl text-sm">Cancel</button>
              <button onClick={submitEdit} disabled={actionLoading}
                className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                {actionLoading ? "Saving…" : "Save Override ✓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <h1 className="font-black text-white text-lg leading-none">Petinder Admin</h1>
            <p className="text-gray-500 text-xs">Operations Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => load()} className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">↻ Refresh</button>
          <button onClick={() => { localStorage.removeItem("admin-key"); router.push("/admin"); }}
            className="text-xs text-gray-500 hover:text-red-400 border border-gray-700 px-3 py-1.5 rounded-lg">Logout</button>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">← App</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6 flex overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              tab === t.id ? "border-brand-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}>
            {t.label}{t.count !== undefined ? <span className="ml-1.5 text-xs text-gray-600">({t.count})</span> : null}
          </button>
        ))}
      </div>

      <div className="p-6">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label:"Total Pets",        value: stats.totalPets,        emoji:"🐾", color:"text-orange-400" },
                { label:"Providers",         value: stats.totalProviders,   emoji:"🏪", color:"text-blue-400" },
                { label:"Services",          value: stats.totalServices,    emoji:"🛎️", color:"text-purple-400" },
                { label:"Bookings",          value: stats.totalBookings,    emoji:"📅", color:"text-green-400" },
                { label:"Total Swipes",      value: stats.totalSwipes,      emoji:"👆", color:"text-pink-400" },
                { label:"Avg Service Price", value: `${stats.avgServicePrice} EGP`, emoji:"💰", color:"text-yellow-400" },
                { label:"Pipeline Revenue",  value: `${stats.pendingRevenue.toLocaleString()} EGP`, emoji:"📈", color:"text-emerald-400" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wide">Top Pets by Likes</h3>
                <div className="space-y-3">
                  {data.topPets.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-gray-600 text-sm w-4">{i+1}</span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                        <Image src={p.photoUrl} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.breed}</div>
                      </div>
                      <div className="text-pink-400 font-bold text-sm">❤️ {p._count.swipes}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="font-bold text-gray-300 mb-4 text-sm uppercase tracking-wide">Recent Bookings</h3>
                <div className="space-y-3">
                  {data.recentBookings.slice(0,6).map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{b.service.title}</div>
                        <div className="text-xs text-gray-500">{b.clientName} · {b.provider.name}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-green-400 font-bold text-xs">{b.service.priceEGP} EGP</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[b.status] ?? "bg-gray-700 text-gray-400"}`}>{b.status}</span>
                      </div>
                    </div>
                  ))}
                  {data.recentBookings.length === 0 && <p className="text-gray-600 text-sm">No bookings yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search bar for entity tabs */}
        {tab !== "overview" && (
          <div className="mb-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}…`}
              className="w-full max-w-sm px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand-500 placeholder-gray-600" />
          </div>
        )}

        {/* ── PROVIDERS ── */}
        {tab === "providers" && (
          <div className="space-y-3">
            {filteredProviders.map((p) => (
              <div key={p.id} className={`bg-gray-900 border rounded-2xl p-4 ${p.isApproved ? "border-gray-800" : "border-red-900"}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{p.avatarEmoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white">{p.name}</h3>
                      {p.isVerified && <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>}
                      {!p.isApproved && <span className="text-xs bg-red-900 text-red-400 px-2 py-0.5 rounded-full font-semibold">⛔ Suspended</span>}
                      {p.merchantKey && <span className="text-xs bg-purple-900 text-purple-400 px-2 py-0.5 rounded-full font-semibold">🔑 Has portal</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {p.neighborhood} · ⭐ {p.rating} · {p._count.services} services · {p._count.bookings} bookings</p>
                    {p.whatsapp && <p className="text-xs text-gray-600 mt-0.5">📱 {p.whatsapp}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit("provider", p as unknown as Record<string,unknown>)}
                      className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700">Edit</button>
                    <button onClick={() => override("provider", p.id, p.isVerified ? "verify" : "verify", { current: p.isVerified })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${p.isVerified ? "bg-yellow-900 text-yellow-400" : "bg-green-900 text-green-400"}`}>
                      {p.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button onClick={() => override("provider", p.id, p.isApproved ? "suspend" : "approve")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${p.isApproved ? "bg-red-900 text-red-400" : "bg-blue-900 text-blue-400"}`}>
                      {p.isApproved ? "Suspend" : "Restore"}
                    </button>
                    <button onClick={() => override("provider", p.id, "delete")}
                      className="px-3 py-1.5 bg-red-950 text-red-500 text-xs font-semibold rounded-lg hover:bg-red-900">Delete</button>
                  </div>
                </div>
                {p.merchantKey && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <a href={`/merchant/${p.merchantKey}`} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-purple-400 hover:underline font-mono">
                      /merchant/{p.merchantKey} →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div className="space-y-2">
            {filteredServices.map((s) => (
              <div key={s.id} className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 ${s.isAvailable ? "border-gray-800" : "border-gray-800 opacity-60"}`}>
                <div className="text-2xl w-8 text-center">{CAT_EMOJI[s.category] ?? "🐾"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                    {!s.isAvailable && <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Paused</span>}
                    {s.atHomeOnly && <span className="text-xs bg-blue-900 text-blue-400 px-2 py-0.5 rounded-full">At-home</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{s.provider.name} · {s.provider.neighborhood}</p>
                </div>
                <div className="text-brand-400 font-black text-lg flex-shrink-0">{s.priceEGP.toLocaleString()} <span className="text-xs font-medium text-gray-500">EGP</span></div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit("service", s as unknown as Record<string,unknown>)}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700">Edit</button>
                  <button onClick={() => override("service", s.id, "toggle")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${s.isAvailable ? "bg-yellow-900 text-yellow-400" : "bg-green-900 text-green-400"}`}>
                    {s.isAvailable ? "Pause" : "Restore"}
                  </button>
                  <button onClick={() => override("service", s.id, "delete")}
                    className="px-3 py-1.5 bg-red-950 text-red-500 text-xs font-semibold rounded-lg">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{CAT_EMOJI[b.service.category] ?? "🐾"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{b.service.title}</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? "bg-gray-700 text-gray-400"}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">👤 {b.clientName} · 🐾 {b.petName} · 📱 {b.clientPhone}</p>
                    <p className="text-xs text-gray-600 mt-0.5">Provider: {b.provider.name} · 📅 {new Date(b.scheduledAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short" })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-green-400 font-black text-sm">{b.service.priceEGP} EGP</div>
                    <div className="flex gap-1.5 mt-2">
                      {b.status === "pending" && (
                        <button onClick={() => override("booking", b.id, "confirm")}
                          className="px-2 py-1 bg-green-900 text-green-400 text-xs rounded-lg font-semibold">Confirm</button>
                      )}
                      {b.status !== "completed" && b.status !== "cancelled" && (
                        <button onClick={() => override("booking", b.id, "complete")}
                          className="px-2 py-1 bg-blue-900 text-blue-400 text-xs rounded-lg font-semibold">Done</button>
                      )}
                      {b.status !== "cancelled" && (
                        <button onClick={() => override("booking", b.id, "cancel")}
                          className="px-2 py-1 bg-red-950 text-red-400 text-xs rounded-lg font-semibold">Cancel</button>
                      )}
                      <button onClick={() => override("booking", b.id, "delete")}
                        className="px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg">Del</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredBookings.length === 0 && <p className="text-gray-600 text-sm py-8 text-center">No bookings match your search.</p>}
          </div>
        )}

        {/* ── PETS ── */}
        {tab === "pets" && (
          <div className="space-y-2">
            {filteredPets.map((p) => (
              <div key={p.id} className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 ${p.isAvailable ? "border-gray-800" : "border-gray-800 opacity-60"}`}>
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  <Image src={p.photoUrl} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{p.name}</h4>
                    {p.adoptedAt && <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">🏠 Adopted</span>}
                    {!p.isAvailable && !p.adoptedAt && <span className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{p.breed} · {p.location}</p>
                  <p className="text-xs text-pink-400 mt-0.5">❤️ {p._count.swipes} likes</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit("pet", p as unknown as Record<string,unknown>)}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700">Edit</button>
                  <button onClick={() => override("pet", p.id, p.adoptedAt ? "unadopt" : "adopt")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${p.adoptedAt ? "bg-blue-900 text-blue-400" : "bg-green-900 text-green-400"}`}>
                    {p.adoptedAt ? "Unadopt" : "Mark Adopted"}
                  </button>
                  <button onClick={() => override("pet", p.id, "delete")}
                    className="px-3 py-1.5 bg-red-950 text-red-500 text-xs font-semibold rounded-lg">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
