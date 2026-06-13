"use client";

import Image from "next/image";
import type { Pet } from "@/lib/types";

interface MatchModalProps {
  pet: Pet;
  onClose: () => void;
  onViewMatches: () => void;
}

export default function MatchModal({ pet, onClose, onViewMatches }: MatchModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti header */}
        <div className="bg-gradient-to-r from-brand-400 to-pink-500 p-6 text-center text-white">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-3xl font-black">It&apos;s a Match!</h2>
          <p className="text-white/80 mt-1">You and {pet.name} liked each other</p>
        </div>

        {/* Pet photo */}
        <div className="relative h-48 bg-gray-100">
          <Image
            src={pet.photoUrl}
            alt={pet.name}
            fill
            className="object-cover"
            sizes="384px"
          />
        </div>

        {/* Info */}
        <div className="p-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
          <p className="text-gray-500 mb-1">{pet.breed}</p>
          <p className="text-sm text-gray-400 mb-4">📍 {pet.shelterName} · {pet.location}</p>

          <a
            href={`mailto:${pet.shelterEmail}?subject=I'm interested in adopting ${pet.name}!&body=Hi! I saw ${pet.name} on Petinder and would love to learn more about adopting them.`}
            className="block w-full py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors mb-3"
          >
            📧 Contact Shelter
          </a>

          <button
            onClick={onViewMatches}
            className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors mb-3"
          >
            View All Matches
          </button>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Keep swiping →
          </button>
        </div>
      </div>
    </div>
  );
}
