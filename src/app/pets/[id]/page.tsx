"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { Pet } from "@/lib/types";

function formatAge(months: number): string {
  if (months < 12) return `${months} months old`;
  const y = Math.floor(months / 12);
  return `${y} year${y > 1 ? "s" : ""} old`;
}

const ENERGY_STYLE: Record<string, string> = {
  low:    "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high:   "bg-red-100 text-red-700",
};
const SIZE_EMOJI: Record<string, string> = { small: "🐾", medium: "🐕", large: "🦮" };

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { sessionId, preferences } = useLocalSession();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/pets/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setPet(data); setLoading(false); });
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Meet ${pet?.name} on Petinder!`,
      text: `${pet?.name} is a ${pet?.breed} looking for a forever home. Check them out!`,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (!sessionId || liked) return;
    await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, petId: id, direction: "like" }),
    });
    setLiked(true);
  };

  const handleGenerateBio = async () => {
    if (!pet) return;
    setBioLoading(true);
    const res = await fetch("/api/generate-bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId: pet.id }),
    });
    if (res.ok) {
      const { bio } = await res.json();
      setPet((p) => p ? { ...p, aiBio: bio } : p);
    }
    setBioLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-6xl animate-pulse">🐾</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
        <div className="text-6xl mb-4">😿</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet not found</h2>
        <Link href="/discover" className="text-brand-500 hover:underline">← Back to Discover</Link>
      </div>
    );
  }

  const distance = (pet as Pet & { distanceMiles?: number | null }).distanceMiles;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back nav */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors">
        ← Back
      </button>

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
        {/* Photo */}
        <div className="relative h-80 sm:h-96 bg-gray-100">
          <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 672px" priority />

          {/* Adopted badge */}
          {pet.adoptedAt && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-2xl px-6 py-3 text-center">
                <div className="text-3xl mb-1">🏠</div>
                <p className="font-bold text-gray-900">Already Adopted</p>
                <p className="text-sm text-gray-500">This pet found their home!</p>
              </div>
            </div>
          )}

          {/* Location + distance */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="bg-black/50 text-white text-xs rounded-full px-2.5 py-1">
              📍 {pet.location}
            </span>
            {distance != null && (
              <span className="bg-brand-500 text-white text-xs font-bold rounded-full px-2.5 py-1">
                {distance} mi away
              </span>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md hover:bg-white transition-colors"
            title="Share"
          >
            {copied ? <span className="text-sm font-bold text-green-600">✓</span> : <span className="text-lg">🔗</span>}
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{pet.name}</h1>
              <p className="text-gray-500 mt-0.5">{pet.breed} · {pet.species}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-700">{formatAge(pet.ageMonths)}</div>
              <div className="text-sm text-gray-400 capitalize">{pet.gender}</div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${ENERGY_STYLE[pet.energyLevel] ?? "bg-gray-100 text-gray-600"}`}>
              {pet.energyLevel} energy
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
              {SIZE_EMOJI[pet.size]} {pet.size}
            </span>
            {pet.goodWithKids && (
              <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">👶 kid-friendly</span>
            )}
            {pet.goodWithPets && (
              <span className="text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">🐕 pet-friendly</span>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900">About {pet.name}</h2>
              {!pet.aiBio && !pet.adoptedAt && (
                <button
                  onClick={handleGenerateBio}
                  disabled={bioLoading}
                  className="text-xs text-brand-500 font-semibold hover:underline disabled:opacity-50"
                >
                  {bioLoading ? "Generating…" : "✨ Generate AI Bio"}
                </button>
              )}
              {pet.aiBio && (
                <span className="text-xs text-purple-500 font-semibold">✨ AI Bio</span>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">{pet.aiBio || pet.description}</p>
          </div>

          {/* Compatibility */}
          {preferences && !pet.adoptedAt && (
            <CompatibilityBadge pet={pet} preferences={preferences} />
          )}

          {/* Shelter */}
          <div className="border-t border-gray-100 pt-4 mt-4 mb-6">
            <h2 className="font-bold text-gray-900 mb-1">Shelter</h2>
            <p className="text-gray-600">{pet.shelterName}</p>
            <p className="text-gray-400 text-sm">{pet.location}</p>
          </div>

          {/* Actions */}
          {!pet.adoptedAt ? (
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex-1 py-3 rounded-full font-bold text-lg transition-all ${
                  liked
                    ? "bg-green-100 text-green-700 border-2 border-green-200"
                    : "bg-brand-500 text-white hover:bg-brand-600 shadow-md"
                }`}
              >
                {liked ? "❤️ Saved!" : "❤️ Like"}
              </button>
              <a
                href={`mailto:${pet.shelterEmail}?subject=I'm interested in adopting ${pet.name}!&body=Hi! I saw ${pet.name} on Petinder and I'd love to learn more about adopting them. Could you share details about the adoption process?`}
                className="flex-1 py-3 rounded-full font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                📧 Contact
              </a>
            </div>
          ) : (
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <p className="text-green-800 font-semibold">🏠 This pet has been adopted!</p>
              <Link href="/discover" className="text-brand-500 text-sm font-medium hover:underline mt-1 block">
                Find more pets →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompatibilityBadge({ pet, preferences }: { pet: Pet; preferences: NonNullable<ReturnType<typeof useLocalSession>["preferences"]> }) {
  const [result, setResult] = useState<{ score: number; emoji: string; label: string; reason: string } | null>(null);

  useEffect(() => {
    fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet, preferences }),
    })
      .then((r) => r.json())
      .then(setResult)
      .catch(() => {});
  }, [pet, preferences]);

  if (!result) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-4 border border-orange-100 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{result.emoji}</div>
        <div>
          <p className="font-bold text-gray-900">{result.label} — {result.score}% compatible</p>
          <p className="text-sm text-gray-500">{result.reason}</p>
        </div>
      </div>
    </div>
  );
}
