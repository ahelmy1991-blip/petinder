"use client";

import Image from "next/image";
import { useState } from "react";
import type { Pet, CompatibilityResult } from "@/lib/types";

interface PetCardProps {
  pet: Pet;
  compatibility?: CompatibilityResult;
  flyDirection?: "left" | "right" | null;
  isTop?: boolean;
  stackIndex?: number;
}

function formatAge(months: number): string {
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  return `${years}yr${years > 1 ? "s" : ""}`;
}

const SIZE_EMOJI: Record<string, string> = { small: "🐾", medium: "🐕", large: "🦮" };
const ENERGY_COLOR: Record<string, string> = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function PetCard({
  pet, compatibility, flyDirection, isTop = false, stackIndex = 0,
}: PetCardProps) {
  const [expanded, setExpanded] = useState(false);

  const flyClass =
    flyDirection === "right" ? "animate-fly-right" :
    flyDirection === "left"  ? "animate-fly-left"  : "";

  const stackClass =
    stackIndex === 1 ? "card-stack-2" :
    stackIndex === 2 ? "card-stack-3" : "";

  return (
    <div
      className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white
                  transition-transform duration-300 ${flyClass} ${stackClass}`}
      style={{ zIndex: 10 - stackIndex }}
    >
      {/* Photo */}
      <div className="relative h-[58%] bg-gray-100 flex-shrink-0">
        <Image
          src={pet.photoUrl}
          alt={pet.name}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 480px"
          priority={isTop}
        />

        {/* Swipe indicators (only shown on top card) */}
        {isTop && flyDirection === "right" && (
          <div className="absolute inset-0 like-indicator flex items-center justify-center">
            <span className="text-white text-5xl font-black border-4 border-white rounded-2xl px-4 py-2 rotate-[-20deg]">LIKE</span>
          </div>
        )}
        {isTop && flyDirection === "left" && (
          <div className="absolute inset-0 pass-indicator flex items-center justify-center">
            <span className="text-white text-5xl font-black border-4 border-white rounded-2xl px-4 py-2 rotate-[20deg]">NOPE</span>
          </div>
        )}

        {/* Compatibility badge */}
        {compatibility && isTop && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
            <span className="text-lg">{compatibility.emoji}</span>
            <span className="text-sm font-bold text-gray-800">{compatibility.score}%</span>
          </div>
        )}

        {/* Location badge */}
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs rounded-full px-2.5 py-1">
          📍 {pet.location}
        </div>
      </div>

      {/* Info panel */}
      <div className="flex flex-col h-[42%] p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">{pet.name}</h2>
            <p className="text-gray-500 text-sm">{pet.breed}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-700">{formatAge(pet.ageMonths)}</div>
            <div className="text-sm text-gray-400 capitalize">{pet.gender}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ENERGY_COLOR[pet.energyLevel] ?? "bg-gray-100 text-gray-600"}`}>
            {pet.energyLevel} energy
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
            {SIZE_EMOJI[pet.size]} {pet.size}
          </span>
          {pet.goodWithKids && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">👶 kid-friendly</span>
          )}
          {pet.goodWithPets && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">🐕 pet-friendly</span>
          )}
        </div>

        {/* Bio */}
        <div className="flex-1 overflow-hidden">
          <p className={`text-gray-600 text-sm leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
            {pet.aiBio || pet.description}
          </p>
        </div>

        {/* Expand/shelter row */}
        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-brand-500 text-xs font-semibold hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
          <span className="text-xs text-gray-400">{pet.shelterName}</span>
        </div>
      </div>
    </div>
  );
}
