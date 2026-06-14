"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { Pet } from "@/lib/types";

function formatAge(months: number) {
  if (months < 12) return `${months} months`;
  const y = Math.floor(months / 12);
  return `${y} year${y > 1 ? "s" : ""}`;
}

export default function MatchesPage() {
  const { sessionId } = useLocalSession();
  const [matches, setMatches] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/matches?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => { setMatches(Array.isArray(data) ? data : []); setLoading(false); });
  }, [sessionId]);

  if (loading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-6xl animate-pulse">❤️</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
        <div className="text-6xl mb-4">💔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h2>
        <p className="text-gray-500 mb-6">Start swiping to find pets you love!</p>
        <Link
          href="/discover"
          className="px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors"
        >
          🐾 Start Swiping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Your Matches ❤️</h1>
        <p className="text-gray-500 mt-1">
          {matches.length} pet{matches.length !== 1 ? "s" : ""} waiting to meet you
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((pet) => (
          <MatchCard key={pet.id} pet={pet} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/discover"
          className="inline-block px-8 py-3 border-2 border-brand-500 text-brand-500 font-bold rounded-full hover:bg-brand-50 transition-colors"
        >
          Keep Swiping 🐾
        </Link>
      </div>
    </div>
  );
}

function MatchCard({ pet }: { pet: Pet }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/pets/${pet.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `Meet ${pet.name}!`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-56">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {pet.distanceMiles != null && (
          <div className="absolute top-2 right-2 bg-brand-500 text-white text-xs font-bold rounded-full px-2 py-1">
            {pet.distanceMiles} mi
          </div>
        )}
        {pet.adoptedAt && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold px-3 py-1 rounded-full text-sm">🏠 Adopted</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
            <p className="text-gray-500 text-sm">{pet.breed}</p>
          </div>
          <span className="text-sm text-gray-400 font-medium">{formatAge(pet.ageMonths)}</span>
        </div>

        <p className="text-gray-400 text-xs mb-3">📍 {pet.shelterName} · {pet.location}</p>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {pet.aiBio || pet.description}
        </p>

        <div className="flex gap-2">
          <Link
            href={`/pets/${pet.id}`}
            className="flex-1 text-center py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 transition-colors text-sm"
          >
            View Profile
          </Link>
          <button
            onClick={handleShare}
            className="px-3 py-2.5 border-2 border-purple-100 bg-purple-50 text-purple-600 font-semibold rounded-full hover:bg-purple-100 transition-colors text-sm"
            title="Share"
          >
            {copied ? "✓" : "🔗"}
          </button>
        </div>

        {!pet.adoptedAt && (
          <a
            href={`mailto:${pet.shelterEmail}?subject=I'd love to adopt ${pet.name}!&body=Hi ${pet.shelterName}! I matched with ${pet.name} on Petinder and I'm very interested in adopting them. Could you share more about the adoption process?`}
            className="block text-center py-2.5 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors text-sm mt-2"
          >
            📧 Contact Shelter
          </a>
        )}
      </div>
    </div>
  );
}
