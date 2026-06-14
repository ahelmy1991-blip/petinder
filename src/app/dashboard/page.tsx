"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface DashboardPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  photoUrl: string;
  location: string;
  isAvailable: boolean;
  adoptedAt: string | null;
  createdAt: string;
  _count: { swipes: number };
}

function formatAge(months: number): string {
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12);
  return `${y}yr${y > 1 ? "s" : ""}`;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [pets, setPets] = useState<DashboardPet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const loadPets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/dashboard?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    if (!res.ok) { setError("Could not load listings. Check your email."); setLoading(false); return; }
    const data = await res.json();
    setPets(data);
    setSubmittedEmail(email.trim().toLowerCase());
    setLoading(false);
  };

  const markAdopted = async (id: string) => {
    const res = await fetch(`/api/pets/${id}/adopt`, { method: "PATCH" });
    if (res.ok) {
      setPets((prev) => prev.map((p) => p.id === id ? { ...p, isAvailable: false, adoptedAt: new Date().toISOString() } : p));
      setActionMsg("Marked as adopted! 🏠");
      setTimeout(() => setActionMsg(""), 3000);
    }
  };

  const deletePet = async (id: string) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;
    const res = await fetch(`/api/pets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPets((prev) => prev.filter((p) => p.id !== id));
      setActionMsg("Listing removed.");
      setTimeout(() => setActionMsg(""), 3000);
    }
  };

  const available = pets.filter((p) => p.isAvailable);
  const adopted   = pets.filter((p) => !p.isAvailable);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Shelter Dashboard 🏠</h1>
        <p className="text-gray-500 mt-1">Manage your pet listings and track adoption interest.</p>
      </div>

      {!submittedEmail ? (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="text-5xl text-center mb-4">🏥</div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Access Your Listings</h2>
            <form onSubmit={loadPets} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Shelter email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="adopt@yourshelter.org"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:outline-none transition-colors"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                {loading ? "Loading…" : "View My Listings →"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-4">
              Enter the email you used when listing pets. No password needed.
            </p>
          </div>
          <div className="text-center mt-6">
            <Link href="/list-pet" className="text-brand-500 font-semibold hover:underline">
              ➕ List a New Pet
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Action toast */}
          {actionMsg && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg z-50 animate-pop-in">
              {actionMsg}
            </div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-3xl font-black text-brand-500">{pets.length}</div>
              <div className="text-sm text-gray-500 mt-1">Total Listings</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-3xl font-black text-green-500">{available.length}</div>
              <div className="text-sm text-gray-500 mt-1">Available</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
              <div className="text-3xl font-black text-purple-500">
                {pets.reduce((s, p) => s + p._count.swipes, 0)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total Likes</div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Listings for <span className="text-brand-500">{submittedEmail}</span>
            </h2>
            <div className="flex gap-3">
              <Link
                href="/list-pet"
                className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-full text-sm hover:bg-brand-600 transition-colors"
              >
                ➕ Add Pet
              </Link>
              <button
                onClick={() => { setSubmittedEmail(""); setPets([]); setEmail(""); }}
                className="px-4 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-full text-sm hover:border-gray-300 transition-colors"
              >
                Switch
              </button>
            </div>
          </div>

          {pets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">List your first pet to start finding them a home.</p>
              <Link href="/list-pet" className="px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors">
                List a Pet →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available */}
              {available.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Available ({available.length})
                  </h3>
                  <div className="space-y-3">
                    {available.map((pet) => (
                      <PetRow key={pet.id} pet={pet} onAdopt={markAdopted} onDelete={deletePet} />
                    ))}
                  </div>
                </div>
              )}

              {/* Adopted */}
              {adopted.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                    Adopted ({adopted.length})
                  </h3>
                  <div className="space-y-3">
                    {adopted.map((pet) => (
                      <PetRow key={pet.id} pet={pet} onAdopt={markAdopted} onDelete={deletePet} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PetRow({
  pet,
  onAdopt,
  onDelete,
}: {
  pet: DashboardPet;
  onAdopt: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
      pet.adoptedAt ? "border-green-100 opacity-75" : "border-transparent hover:border-gray-100"
    }`}>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" sizes="64px" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{pet.name}</h3>
            {pet.adoptedAt ? (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">🏠 Adopted</span>
            ) : (
              <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">✓ Available</span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{pet.breed} · {formatAge(pet.ageMonths)} · {pet.location}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-red-400 text-sm">❤️</span>
            <span className="text-xs text-gray-500">{pet._count.swipes} like{pet._count.swipes !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          <Link
            href={`/pets/${pet.id}`}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-full hover:border-gray-300 transition-colors text-center"
          >
            View
          </Link>
          {!pet.adoptedAt && (
            <button
              onClick={() => onAdopt(pet.id)}
              className="px-3 py-1.5 text-xs font-semibold text-green-700 border border-green-200 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
            >
              Mark Adopted
            </button>
          )}
          <button
            onClick={() => onDelete(pet.id)}
            className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
