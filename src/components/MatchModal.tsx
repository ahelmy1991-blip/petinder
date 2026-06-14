"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Pet } from "@/lib/types";

interface Props {
  pet: Pet;
  onClose: () => void;
  onViewMatches: () => void;
}

export default function MatchModal({ pet, onClose, onViewMatches }: Props) {
  const [copied, setCopied]   = useState(false);
  const [hearts, setHearts]   = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);

  // Burst hearts on mount
  useEffect(() => {
    setHearts(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        size: 14 + Math.random() * 18,
      }))
    );
  }, []);

  const handleShare = async () => {
    const url = `${window.location.origin}/pets/${pet.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: `I matched with ${pet.name} on Petinder! 🐾`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hearts.map((h) => (
          <div
            key={h.id}
            className="absolute animate-heart-float"
            style={{
              left: `${h.x}%`,
              bottom: "0",
              animationDelay: `${h.delay}s`,
              fontSize: `${h.size}px`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-brand-500 via-pink-500 to-purple-500 p-7 text-center text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          <div className="relative">
            <div className="text-5xl mb-2 animate-bounce">🐾</div>
            <h2 className="text-3xl font-black tracking-tight">It&apos;s a Match!</h2>
            <p className="text-white/80 text-sm mt-1">You and <strong>{pet.name}</strong> liked each other</p>
            {pet.distanceMiles != null && (
              <span className="inline-flex items-center gap-1 mt-2 bg-white/20 rounded-full px-3 py-1 text-xs font-bold">
                📍 {pet.distanceMiles} mi away
              </span>
            )}
          </div>
        </div>

        {/* Photo strip */}
        <div className="relative h-44 bg-gray-100">
          <Image src={pet.photoUrl} alt={pet.name} fill className="object-cover" sizes="384px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-4 text-white">
            <p className="font-black text-xl leading-none">{pet.name}</p>
            <p className="text-white/70 text-xs">{pet.breed} · {pet.location}</p>
          </div>
          <Link
            href={`/pets/${pet.id}`}
            className="absolute bottom-3 right-4 text-xs text-white/80 hover:text-white font-semibold underline underline-offset-2"
            onClick={onClose}
          >
            Full profile →
          </Link>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          <a
            href={`mailto:${pet.shelterEmail}?subject=I matched with ${pet.name} on Petinder! 🐾&body=Hi ${pet.shelterName}!%0A%0AI matched with ${pet.name} on Petinder and I%27d love to start the adoption process. Could you share next steps?%0A%0AThanks!`}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-brand-500 to-pink-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-md"
          >
            📧 Contact {pet.shelterName}
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onViewMatches}
              className="py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              ❤️ My Matches
            </button>
            <button
              onClick={handleShare}
              className="py-3 bg-purple-50 text-purple-700 font-semibold rounded-xl hover:bg-purple-100 transition-colors text-sm"
            >
              {copied ? "✓ Copied!" : "🔗 Share"}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full text-gray-400 hover:text-gray-600 text-sm transition-colors py-1"
          >
            Keep swiping →
          </button>
        </div>
      </div>
    </div>
  );
}
