"use client";

import { useState } from "react";

interface PassportData {
  petName: string;
  species: string;
  breed: string;
  gender: string;
  dobYear: string;
  color: string;
  microchip: string;
  ownerName: string;
  ownerPhone: string;
  neighborhood: string;
  vaccines: { name: string; date: string; nextDue: string }[];
  conditions: string;
  vetName: string;
  vetPhone: string;
}

interface GeneratedPassport {
  summary: string;
  status: string;
  nextAction: string;
}

const EMPTY_VACCINE = { name: "", date: "", nextDue: "" };

const COMMON_VACCINES = [
  "Rabies", "DHPP (Combo)", "Leptospirosis", "Bordetella",
  "FVRCP (Cat Combo)", "FeLV", "Giardia",
];

export default function PetPassportPage() {
  const [step, setStep]             = useState<"form" | "result">("form");
  const [loading, setLoading]       = useState(false);
  const [passport, setPassport]     = useState<GeneratedPassport | null>(null);
  const [data, setData]             = useState<PassportData>({
    petName: "", species: "dog", breed: "", gender: "male",
    dobYear: "", color: "", microchip: "",
    ownerName: "", ownerPhone: "", neighborhood: "",
    vaccines: [{ ...EMPTY_VACCINE }],
    conditions: "", vetName: "", vetPhone: "",
  });

  const addVaccine = () => setData((d) => ({ ...d, vaccines: [...d.vaccines, { ...EMPTY_VACCINE }] }));
  const updateVaccine = (i: number, field: string, val: string) => {
    setData((d) => {
      const v = [...d.vaccines];
      v[i] = { ...v[i], [field]: val };
      return { ...d, vaccines: v };
    });
  };
  const removeVaccine = (i: number) =>
    setData((d) => ({ ...d, vaccines: d.vaccines.filter((_, idx) => idx !== i) }));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/pet-passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      setPassport(result);
      setStep("result");
    }
    setLoading(false);
  };

  if (step === "result" && passport) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Passport card */}
        <div className="bg-gradient-to-br from-brand-500 to-pink-600 rounded-3xl p-1 shadow-2xl mb-6">
          <div className="bg-white rounded-[22px] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-500 to-pink-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Pet Health Passport</p>
                  <h2 className="text-2xl font-black mt-0.5">{data.petName}</h2>
                  <p className="text-white/80 text-sm">{data.breed} · {data.species}</p>
                </div>
                <div className="text-5xl">
                  {data.species === "cat" ? "🐱" : "🐶"}
                </div>
              </div>
            </div>

            {/* Pet details grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5 text-sm">
                {[
                  ["Gender", data.gender],
                  ["Born", data.dobYear || "—"],
                  ["Color", data.color || "—"],
                  ["Microchip", data.microchip || "Not registered"],
                  ["Owner", data.ownerName],
                  ["Area", data.neighborhood || "Cairo"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-gray-400 text-xs uppercase font-semibold">{label}</p>
                    <p className="text-gray-800 font-semibold truncate">{val}</p>
                  </div>
                ))}
              </div>

              {/* AI health summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">AI Health Summary</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{passport.summary}</p>
              </div>

              {/* Status + next action */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-500 font-semibold uppercase">Vaccine Status</p>
                  <p className="text-blue-800 font-bold text-sm mt-1">{passport.status}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-orange-500 font-semibold uppercase">Next Action</p>
                  <p className="text-orange-800 font-bold text-sm mt-1">{passport.nextAction}</p>
                </div>
              </div>

              {/* Vaccines */}
              {data.vaccines.filter((v) => v.name).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vaccination Record</p>
                  <div className="space-y-2">
                    {data.vaccines.filter((v) => v.name).map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-sm bg-gray-50 rounded-xl px-3 py-2">
                        <span className="font-semibold text-gray-700">{v.name}</span>
                        <div className="text-right text-xs text-gray-500">
                          <div>{v.date || "—"}</div>
                          {v.nextDue && <div className="text-orange-500">Due: {v.nextDue}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vet */}
              {data.vetName && (
                <div className="border-t border-gray-100 pt-4 text-sm">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Primary Vet</p>
                  <p className="font-semibold text-gray-800">{data.vetName}</p>
                  {data.vetPhone && <p className="text-gray-500">{data.vetPhone}</p>}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
              <span className="text-xs text-gray-400">Generated by Petinder 🐾</span>
              <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-EG")}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 transition-colors text-sm"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            onClick={() => { setStep("form"); setPassport(null); }}
            className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors text-sm"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📋</div>
        <h1 className="text-2xl font-black text-gray-900">Pet Health Passport</h1>
        <p className="text-gray-500 text-sm mt-2">Generate a digital health record with AI summary for your pet.</p>
      </div>

      <form onSubmit={generate} className="space-y-6">
        {/* Pet info */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🐾</span> Pet Information
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Pet name *</label>
                <input required value={data.petName} onChange={(e) => setData({ ...data, petName: e.target.value })}
                  placeholder="Max" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Species</label>
                <select value={data.species} onChange={(e) => setData({ ...data, species: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
                  <option value="dog">Dog 🐶</option>
                  <option value="cat">Cat 🐱</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Breed</label>
                <input value={data.breed} onChange={(e) => setData({ ...data, breed: e.target.value })}
                  placeholder="Golden Retriever" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Gender</label>
                <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Birth year</label>
                <input value={data.dobYear} onChange={(e) => setData({ ...data, dobYear: e.target.value })}
                  placeholder="2022" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Color / markings</label>
                <input value={data.color} onChange={(e) => setData({ ...data, color: e.target.value })}
                  placeholder="Golden" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Microchip #</label>
                <input value={data.microchip} onChange={(e) => setData({ ...data, microchip: e.target.value })}
                  placeholder="Optional" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Vaccination record */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span>💉</span> Vaccinations</h2>
          <div className="space-y-3 mb-3">
            {data.vaccines.map((v, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Vaccine</label>
                  <select value={v.name} onChange={(e) => updateVaccine(i, "name", e.target.value)}
                    className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-400 bg-white">
                    <option value="">Select…</option>
                    {COMMON_VACCINES.map((vc) => <option key={vc}>{vc}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Date given</label>
                  <input type="date" value={v.date} onChange={(e) => updateVaccine(i, "date", e.target.value)}
                    className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-400" />
                </div>
                <div className="flex gap-1">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Next due</label>
                    <input type="date" value={v.nextDue} onChange={(e) => updateVaccine(i, "nextDue", e.target.value)}
                      className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-400" />
                  </div>
                  {data.vaccines.length > 1 && (
                    <button type="button" onClick={() => removeVaccine(i)}
                      className="mb-0 w-8 h-9 flex items-center justify-center text-red-400 hover:text-red-600 flex-shrink-0 self-end">
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addVaccine}
            className="text-brand-500 text-sm font-semibold hover:underline">
            + Add another vaccine
          </button>

          <div className="mt-4">
            <label className="text-xs font-semibold text-gray-600 block mb-1">Medical conditions / allergies (optional)</label>
            <textarea value={data.conditions} onChange={(e) => setData({ ...data, conditions: e.target.value })}
              rows={2} placeholder="e.g. Hip dysplasia, allergic to chicken, on heart medication…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 resize-none" />
          </div>
        </section>

        {/* Owner + vet */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span>👤</span> Owner & Vet</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Owner name</label>
                <input value={data.ownerName} onChange={(e) => setData({ ...data, ownerName: e.target.value })}
                  placeholder="Ahmed Mohamed" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Phone</label>
                <input value={data.ownerPhone} onChange={(e) => setData({ ...data, ownerPhone: e.target.value })}
                  placeholder="01x xxxx xxxx" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Neighborhood / Area</label>
              <select value={data.neighborhood} onChange={(e) => setData({ ...data, neighborhood: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400 bg-white">
                <option value="">Select…</option>
                {["New Cairo", "Maadi", "Zamalek", "Heliopolis", "Nasr City", "Mohandiseen", "6th October", "Sheikh Zayed", "Giza", "Dokki"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Primary vet / clinic</label>
                <input value={data.vetName} onChange={(e) => setData({ ...data, vetName: e.target.value })}
                  placeholder="Dr. Ahmed Clinic" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Vet phone</label>
                <input value={data.vetPhone} onChange={(e) => setData({ ...data, vetPhone: e.target.value })}
                  placeholder="01x xxxx xxxx" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-400" />
              </div>
            </div>
          </div>
        </section>

        <button type="submit" disabled={loading || !data.petName}
          className="w-full py-4 bg-brand-500 text-white font-black text-lg rounded-full hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-lg">
          {loading ? "✨ Generating Passport…" : "✨ Generate Health Passport"}
        </button>
      </form>
    </div>
  );
}
