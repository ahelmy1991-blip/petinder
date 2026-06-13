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
        <p className="text-gray-500 mt-1">{matches.length} pet{matches.length !== 1 ? "s" : ""} waiting to meet you</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-56">
              <Image
                src={pet.photoUrl}
                alt={pet.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
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

              <a
                href={`mailto:${pet.shelterEmail}?subject=I'd love to adopt ${pet.name}!&body=Hi! I saw ${pet.name} on Petinder and I'm very interested in adopting them. Could you tell me more about the process?`}
                className="block text-center py-2.5 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors text-sm"
              >
                📧 Contact Shelter
              </a>
            </div>
          </div>
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
