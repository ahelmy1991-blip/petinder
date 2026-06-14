"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const DAY_LABELS: Record<string, string> = {
  mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday",
  fri:"Friday", sat:"Saturday", sun:"Sunday",
};
const CATEGORIES = [
  { id:"walks",label:"Walks",emoji:"🦮" },
  { id:"sitting",label:"Sitting",emoji:"🏠" },
  { id:"vets",label:"Vets",emoji:"🩺" },
  { id:"grooming",label:"Grooming",emoji:"✂️" },
  { id:"hotel",label:"Hotel",emoji:"🏨" },
  { id:"taxi",label:"Taxi",emoji:"🚗" },
  { id:"emergency",label:"Emergency",emoji:"🚨" },
];

type DaySchedule = { on: boolean; from: string; to: string };
type Schedule = Record<typeof DAYS[number], DaySchedule> & { overrides?: Record<string, { on: boolean; note?: string; from?: string; to?: string }> };
type Service = {
  id: string; category: string; title: string; description: string;
  priceEGP: number; durationMins: number | null; atHomeOnly: boolean; isAvailable: boolean;
};
type EditSvcData = { title?: string; description?: string; priceEGP?: string; durationMins?: string };
type Provider = {
  id: string; name: string; bio: string; avatarEmoji: string;
  location: string; neighborhood: string; whatsapp: string; email: string;
  rating: number; reviewCount: number; isVerified: boolean;
  merchantKey: string; schedule: Schedule | null;
  services: Service[];
  bookings: Array<{
    id: string; clientName: string; petName: string; status: string;
    scheduledAt: string; createdAt: string;
    service: { title: string; priceEGP: number };
  }>;
  _count: { bookings: number; services: number };
};

type Tab = "catalog" | "schedule" | "bookings" | "profile";

const EMPTY_SVC = { category:"walks", title:"", description:"", priceEGP:"", durationMins:"", atHomeOnly:false };

export default function MerchantDashboard() {
  const { key } = useParams<{ key: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("catalog");
  const [toast, setToast] = useState("");

  // Services state
  const [addingSvc, setAddingSvc] = useState(false);
  const [newSvc, setNewSvc] = useState({ ...EMPTY_SVC });
  const [editingSvc, setEditingSvc] = useState<string | null>(null);
  const [editSvcData, setEditSvcData] = useState<EditSvcData>({});
  const [svcLoading, setSvcLoading] = useState(false);

  // Schedule state
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [newOverrideDate, setNewOverrideDate] = useState("");
  const [newOverrideNote, setNewOverrideNote] = useState("");

  // Profile state
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({ name:"", bio:"", whatsapp:"", email:"" });
  const [profileLoading, setProfileLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch(`/api/merchant/${key}`);
    if (r.ok) {
      const d: Provider = await r.json();
      setProvider(d);
      setSchedule(d.schedule ?? buildDefaultSchedule());
      setProfileData({ name: d.name, bio: d.bio, whatsapp: d.whatsapp, email: d.email });
    }
    setLoading(false);
  }, [key]);

  useEffect(() => { load(); }, [load]);

  function buildDefaultSchedule(): Schedule {
    return {
      mon:{on:true,from:"08:00",to:"20:00"},
      tue:{on:true,from:"08:00",to:"20:00"},
      wed:{on:true,from:"08:00",to:"20:00"},
      thu:{on:true,from:"08:00",to:"20:00"},
      fri:{on:false,from:"08:00",to:"20:00"},
      sat:{on:true,from:"10:00",to:"16:00"},
      sun:{on:false,from:"08:00",to:"20:00"},
      overrides:{},
    };
  }

  // ── Service CRUD ────────────────────────────────────────────────────────
  const createService = async () => {
    setSvcLoading(true);
    const r = await fetch(`/api/merchant/${key}/services`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...newSvc, priceEGP: Number(newSvc.priceEGP), durationMins: newSvc.durationMins ? Number(newSvc.durationMins) : null }),
    });
    if (r.ok) { setAddingSvc(false); setNewSvc({ ...EMPTY_SVC }); await load(); showToast("Service added ✓"); }
    setSvcLoading(false);
  };

  const updateService = async (id: string) => {
    setSvcLoading(true);
    const payload = { ...editSvcData };
    if (payload.priceEGP) (payload as unknown as Record<string,unknown>).priceEGP = Number(payload.priceEGP);
    if (payload.durationMins) (payload as unknown as Record<string,unknown>).durationMins = Number(payload.durationMins);
    const r = await fetch(`/api/merchant/${key}/services/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload),
    });
    if (r.ok) { setEditingSvc(null); setEditSvcData({}); await load(); showToast("Updated ✓"); }
    setSvcLoading(false);
  };

  const toggleService = async (svc: Service) => {
    await fetch(`/api/merchant/${key}/services/${svc.id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ isAvailable: !svc.isAvailable }),
    });
    await load();
    showToast(svc.isAvailable ? "Service paused" : "Service live ✓");
  };

  const deleteService = async (id: string) => {
    if (!confirm("Remove this service?")) return;
    await fetch(`/api/merchant/${key}/services/${id}`, { method:"DELETE" });
    await load(); showToast("Service removed");
  };

  // ── Schedule ────────────────────────────────────────────────────────────
  const saveSchedule = async () => {
    if (!schedule) return;
    setScheduleLoading(true);
    const r = await fetch(`/api/merchant/${key}/schedule`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(schedule),
    });
    if (r.ok) showToast("Schedule saved ✓");
    setScheduleLoading(false);
  };

  const updateDay = (day: typeof DAYS[number], field: keyof DaySchedule, val: string | boolean) => {
    if (!schedule) return;
    setSchedule({ ...schedule, [day]: { ...schedule[day], [field]: val } });
  };

  const addOverride = () => {
    if (!newOverrideDate || !schedule) return;
    setSchedule({
      ...schedule,
      overrides: { ...(schedule.overrides ?? {}), [newOverrideDate]: { on: false, note: newOverrideNote || "Day off" } },
    });
    setNewOverrideDate(""); setNewOverrideNote("");
  };

  const removeOverride = (date: string) => {
    if (!schedule) return;
    const overrides = { ...(schedule.overrides ?? {}) };
    delete overrides[date];
    setSchedule({ ...schedule, overrides });
  };

  // ── Profile ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileLoading(true);
    const r = await fetch(`/api/merchant/${key}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(profileData),
    });
    if (r.ok) { setProfileEdit(false); await load(); showToast("Profile updated ✓"); }
    setProfileLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-5xl mb-3 animate-pulse">🐾</div><p className="text-gray-500">Loading your dashboard…</p></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">❌</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid merchant link</h2>
          <a href="/merchant" className="text-brand-500 font-semibold hover:underline">← Go to merchant portal</a>
        </div>
      </div>
    );
  }

  const revenue = provider.bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.service.priceEGP, 0);

  const confirmed = provider.bookings.filter((b) => b.status === "confirmed").length;
  const pending = provider.bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold shadow-xl animate-pop-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-pink-500 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
              {provider.avatarEmoji}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black">{provider.name}</h1>
              <p className="text-white/80 text-sm mt-0.5">📍 {provider.neighborhood} · {provider.isVerified ? "✓ Verified" : "Unverified"}</p>
              <p className="text-white/60 text-xs mt-0.5 font-mono">Key: {key}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label:"Services", value: provider._count.services, emoji:"🛎️" },
              { label:"Bookings", value: provider._count.bookings, emoji:"📅" },
              { label:"Confirmed", value: confirmed, emoji:"✅" },
              { label:"Revenue (EGP)", value: revenue.toLocaleString(), emoji:"💰" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                <div className="text-lg">{s.emoji}</div>
                <div className="text-xl font-black mt-1">{s.value}</div>
                <div className="text-white/70 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 bg-white border-b border-gray-100 z-30">
        <div className="max-w-4xl mx-auto px-4 flex overflow-x-auto scrollbar-hide">
          {(["catalog","schedule","bookings","profile"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all capitalize ${
                tab === t ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              { t === "catalog" ? "📋 Catalog" : t === "schedule" ? "🗓️ Schedule" : t === "bookings" ? `📅 Bookings ${pending > 0 ? `(${pending})` : ""}` : "👤 Profile" }
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">

        {/* ── CATALOG TAB ── */}
        {tab === "catalog" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Service Catalog</h2>
              <button onClick={() => setAddingSvc(true)}
                className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-full text-sm hover:bg-brand-600 transition-colors">
                + Add Service
              </button>
            </div>

            {/* Add service form */}
            {addingSvc && (
              <div className="bg-white rounded-2xl border-2 border-brand-200 p-5 mb-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">New Service</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Category</label>
                    <select value={newSvc.category} onChange={(e) => setNewSvc({...newSvc, category:e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Title *</label>
                    <input value={newSvc.title} onChange={(e) => setNewSvc({...newSvc,title:e.target.value})}
                      placeholder="30-Min Dog Walk"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                  <textarea value={newSvc.description} onChange={(e) => setNewSvc({...newSvc,description:e.target.value})}
                    rows={2} placeholder="What's included in this service…"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Price (EGP) *</label>
                    <input type="number" value={newSvc.priceEGP} onChange={(e) => setNewSvc({...newSvc,priceEGP:e.target.value})}
                      placeholder="250"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Duration (min)</label>
                    <input type="number" value={newSvc.durationMins} onChange={(e) => setNewSvc({...newSvc,durationMins:e.target.value})}
                      placeholder="60"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newSvc.atHomeOnly} onChange={(e) => setNewSvc({...newSvc,atHomeOnly:e.target.checked})}
                        className="w-4 h-4 accent-brand-500" />
                      <span className="text-sm font-medium text-gray-700">At-home only</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAddingSvc(false)}
                    className="flex-1 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-full text-sm hover:border-gray-300">Cancel</button>
                  <button onClick={createService} disabled={svcLoading || !newSvc.title || !newSvc.priceEGP}
                    className="flex-1 py-2 bg-brand-500 text-white font-bold rounded-full text-sm hover:bg-brand-600 disabled:opacity-50">
                    {svcLoading ? "Saving…" : "Add Service ✓"}
                  </button>
                </div>
              </div>
            )}

            {/* Service list grouped by category */}
            {CATEGORIES.map((cat) => {
              const svcs = provider.services.filter((s) => s.category === cat.id);
              if (!svcs.length) return null;
              return (
                <div key={cat.id} className="mb-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{cat.emoji} {cat.label}</h3>
                  <div className="space-y-2">
                    {svcs.map((svc) => (
                      <div key={svc.id} className={`bg-white rounded-2xl border-2 p-4 transition-all ${svc.isAvailable ? "border-transparent" : "border-gray-200 opacity-60"}`}>
                        {editingSvc === svc.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input value={String(editSvcData.title ?? svc.title)}
                                onChange={(e) => setEditSvcData({...editSvcData,title:e.target.value})}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                              <input type="number" value={String(editSvcData.priceEGP ?? svc.priceEGP)}
                                onChange={(e) => setEditSvcData({...editSvcData,priceEGP:e.target.value})}
                                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                            </div>
                            <textarea value={String(editSvcData.description ?? svc.description)} rows={2}
                              onChange={(e) => setEditSvcData({...editSvcData,description:e.target.value})}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => setEditingSvc(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-full text-xs font-semibold">Cancel</button>
                              <button onClick={() => updateService(svc.id)} disabled={svcLoading}
                                className="flex-1 py-2 bg-brand-500 text-white rounded-full text-xs font-bold disabled:opacity-50">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-sm">{svc.title}</h4>
                                {svc.atHomeOnly && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">🏠 At-home</span>}
                                {!svc.isAvailable && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Paused</span>}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{svc.description}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-brand-500 font-black text-lg">{svc.priceEGP.toLocaleString()} <span className="text-xs font-medium text-gray-500">EGP</span></span>
                                {svc.durationMins && <span className="text-xs text-gray-400">{svc.durationMins} min</span>}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button onClick={() => { setEditingSvc(svc.id); setEditSvcData({ title:svc.title, description:svc.description, priceEGP:String(svc.priceEGP) }); }}
                                className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-full hover:border-gray-300">Edit</button>
                              <button onClick={() => toggleService(svc)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-full ${svc.isAvailable ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                                {svc.isAvailable ? "Pause" : "Go Live"}
                              </button>
                              <button onClick={() => deleteService(svc.id)}
                                className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-full border border-red-100">Remove</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {provider.services.length === 0 && !addingSvc && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No services yet. Add your first one!</p>
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === "schedule" && schedule && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Weekly Schedule</h2>
              <button onClick={saveSchedule} disabled={scheduleLoading}
                className="px-5 py-2 bg-brand-500 text-white font-bold rounded-full text-sm hover:bg-brand-600 disabled:opacity-50 transition-colors">
                {scheduleLoading ? "Saving…" : "Save Schedule ✓"}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              {DAYS.map((day, i) => (
                <div key={day} className={`flex items-center gap-4 px-5 py-4 ${i < DAYS.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-24">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={schedule[day].on}
                        onChange={(e) => updateDay(day, "on", e.target.checked)}
                        className="w-4 h-4 accent-brand-500" />
                      <span className={`text-sm font-semibold ${schedule[day].on ? "text-gray-900" : "text-gray-400"}`}>
                        {DAY_LABELS[day].slice(0,3)}
                      </span>
                    </label>
                  </div>
                  <div className={`flex items-center gap-3 flex-1 transition-opacity ${schedule[day].on ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                    <input type="time" value={schedule[day].from}
                      onChange={(e) => updateDay(day, "from", e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={schedule[day].to}
                      onChange={(e) => updateDay(day, "to", e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-400" />
                  </div>
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${schedule[day].on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {schedule[day].on ? "Open" : "Closed"}
                  </div>
                </div>
              ))}
            </div>

            {/* Date overrides */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Date Overrides (holidays, special dates)</h3>
              <div className="flex gap-2 mb-3">
                <input type="date" value={newOverrideDate} onChange={(e) => setNewOverrideDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                <input value={newOverrideNote} onChange={(e) => setNewOverrideNote(e.target.value)}
                  placeholder="e.g. Holiday, Half day"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
                <button onClick={addOverride} disabled={!newOverrideDate}
                  className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 disabled:opacity-40">
                  Block Day
                </button>
              </div>

              {Object.entries(schedule.overrides ?? {}).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(schedule.overrides ?? {}).sort().map(([date, info]) => (
                    <div key={date} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      <div>
                        <span className="text-sm font-semibold text-red-700">{date}</span>
                        {info.note && <span className="text-xs text-red-500 ml-2">— {info.note}</span>}
                      </div>
                      <button onClick={() => removeOverride(date)} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No date overrides set.</p>
              )}
            </div>
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === "bookings" && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">Booking History</h2>
            {provider.bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-gray-500 font-medium">No bookings yet. Share your WhatsApp to start getting clients!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {provider.bookings.map((b) => {
                  const statusColor: Record<string,string> = {
                    pending: "bg-yellow-100 text-yellow-700",
                    confirmed: "bg-green-100 text-green-700",
                    completed: "bg-blue-100 text-blue-700",
                    cancelled: "bg-red-100 text-red-500",
                  };
                  return (
                    <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-sm">{b.service.title}</h4>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[b.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            👤 {b.clientName} · 🐾 {b.petName} · 📅 {new Date(b.scheduledAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-brand-500 font-black text-lg">{b.service.priceEGP} <span className="text-xs font-medium text-gray-400">EGP</span></div>
                          <div className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-gray-900">Your Profile</h2>
              {!profileEdit && (
                <button onClick={() => setProfileEdit(true)}
                  className="px-4 py-2 border-2 border-gray-200 text-gray-700 font-semibold rounded-full text-sm hover:border-brand-300">
                  Edit Profile
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              {profileEdit ? (
                <>
                  <div><label className="text-xs font-semibold text-gray-600 block mb-1">Business name</label>
                    <input value={profileData.name} onChange={(e) => setProfileData({...profileData,name:e.target.value})}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none" /></div>
                  <div><label className="text-xs font-semibold text-gray-600 block mb-1">Bio</label>
                    <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData,bio:e.target.value})}
                      rows={3} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none resize-none" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold text-gray-600 block mb-1">WhatsApp</label>
                      <input value={profileData.whatsapp} onChange={(e) => setProfileData({...profileData,whatsapp:e.target.value})}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none" /></div>
                    <div><label className="text-xs font-semibold text-gray-600 block mb-1">Email</label>
                      <input value={profileData.email} onChange={(e) => setProfileData({...profileData,email:e.target.value})}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-brand-500 focus:outline-none" /></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => setProfileEdit(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-full text-sm">Cancel</button>
                    <button onClick={saveProfile} disabled={profileLoading}
                      className="flex-1 py-2.5 bg-brand-500 text-white font-bold rounded-full text-sm disabled:opacity-50">
                      {profileLoading ? "Saving…" : "Save Changes ✓"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">Name</span><span className="text-gray-900">{provider.name}</span></div>
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">Bio</span><span className="text-gray-700">{provider.bio || "—"}</span></div>
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">Location</span><span className="text-gray-700">{provider.neighborhood}</span></div>
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">WhatsApp</span><span className="text-gray-700">{provider.whatsapp || "—"}</span></div>
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">Email</span><span className="text-gray-700">{provider.email || "—"}</span></div>
                    <div className="flex gap-3"><span className="font-semibold text-gray-500 w-24">Status</span>
                      <span className={`font-semibold ${provider.isVerified ? "text-green-600" : "text-yellow-600"}`}>
                        {provider.isVerified ? "✓ Verified provider" : "⏳ Pending verification"}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Your private merchant link</p>
                    <div className="flex gap-2 items-center">
                      <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-600 truncate">
                        {typeof window !== "undefined" ? `${window.location.origin}/merchant/${key}` : `/merchant/${key}`}
                      </code>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/merchant/${key}`); showToast("Link copied!"); }}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200">Copy</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Keep this link private — it gives full access to your dashboard.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
