"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SPECIES = ["dog", "cat", "rabbit", "bird", "guinea-pig", "other"];
const GENDERS = ["male", "female"];
const SIZES = ["small", "medium", "large"];
const ENERGY = ["low", "medium", "high"];

export default function ListPetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", species: "dog", breed: "", ageMonths: "",
    gender: "male", size: "medium", energyLevel: "medium",
    goodWithKids: false, goodWithPets: false,
    description: "", photoUrl: "",
    shelterName: "", shelterEmail: "", location: "",
  });
  const [generatingBio, setGeneratingBio] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const generateBio = async () => {
    if (!form.name || !form.breed) {
      setError("Fill in the pet name and breed first.");
      return;
    }
    setError("");
    setGeneratingBio(true);
    // Create a temp pet to generate bio, then delete it
    const createRes = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ageMonths: Number(form.ageMonths) || 12 }),
    });
    const tempPet = await createRes.json();
    if (!tempPet.id) { setGeneratingBio(false); return; }

    const bioRes = await fetch("/api/generate-bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: tempPet.id }),
    });
    const { bio } = await bioRes.json();
    set("description", bio || form.description);
    setGeneratingBio(false);

    // Delete the temp record (it'll be re-created on submit)
    await fetch(`/api/pets/${tempPet.id}`, { method: "DELETE" }).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ageMonths: Number(form.ageMonths) }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to list pet.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/discover"), 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{form.name} is listed!</h2>
        <p className="text-gray-500">Redirecting to discover...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">List a Pet ➕</h1>
        <p className="text-gray-500 mt-1">Help a rescue animal find their perfect match</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pet Name *</label>
            <input required value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="e.g. Mochi" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Species *</label>
            <select required value={form.species} onChange={(e) => set("species", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Breed *</label>
            <input required value={form.breed} onChange={(e) => set("breed", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="e.g. Ragdoll" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Age (months) *</label>
            <input required type="number" min="1" max="300" value={form.ageMonths}
              onChange={(e) => set("ageMonths", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="e.g. 18" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Gender", key: "gender", options: GENDERS },
            { label: "Size", key: "size", options: SIZES },
            { label: "Energy", key: "energyLevel", options: ENERGY },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
              <select value={form[key as keyof typeof form] as string}
                onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Compatibility toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.goodWithKids}
              onChange={(e) => set("goodWithKids", e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <span className="text-sm font-medium text-gray-700">👶 Good with kids</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.goodWithPets}
              onChange={(e) => set("goodWithPets", e.target.checked)}
              className="w-4 h-4 accent-brand-500" />
            <span className="text-sm font-medium text-gray-700">🐕 Good with pets</span>
          </label>
        </div>

        {/* Description / bio */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-semibold text-gray-700">Description *</label>
            <button
              type="button"
              onClick={generateBio}
              disabled={generatingBio}
              className="text-xs text-brand-500 font-semibold hover:text-brand-600 disabled:text-gray-400 flex items-center gap-1"
            >
              {generatingBio ? "Generating..." : "✨ AI Generate Bio"}
            </button>
          </div>
          <textarea
            required
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            placeholder="Tell potential adopters about this pet's personality..." />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Photo URL</label>
          <input value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="https://... (leave blank for placeholder)" />
        </div>

        {/* Shelter info */}
        <div className="border-t pt-4 space-y-4">
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Shelter / Contact Info</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shelter Name *</label>
              <input required value={form.shelterName} onChange={(e) => set("shelterName", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="Happy Paws Rescue" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email *</label>
              <input required type="email" value={form.shelterEmail}
                onChange={(e) => set("shelterEmail", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                placeholder="adopt@shelter.org" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
            <input required value={form.location} onChange={(e) => set("location", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="Austin, TX" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-brand-500 text-white font-bold text-lg rounded-full hover:bg-brand-600 disabled:opacity-60 transition-colors shadow-md"
        >
          {submitting ? "Listing..." : "🐾 List This Pet"}
        </button>
      </form>
    </div>
  );
}
