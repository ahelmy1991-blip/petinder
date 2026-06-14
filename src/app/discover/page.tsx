"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PetCard from "@/components/PetCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchModal from "@/components/MatchModal";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { Pet, CompatibilityResult } from "@/lib/types";

interface Filters {
  size: string;
  energy: string;
  goodWithKids: boolean;
  goodWithPets: boolean;
  radius: number;
}

const DEFAULT_FILTERS: Filters = {
  size: "any",
  energy: "any",
  goodWithKids: false,
  goodWithPets: false,
  radius: 50,
};

function buildPetsUrl(sessionId: string, prefs: ReturnType<typeof useLocalSession>["preferences"], filters: Filters) {
  const p = new URLSearchParams({ sessionId });
  if (prefs?.preferredSpecies && prefs.preferredSpecies !== "any") p.set("species", prefs.preferredSpecies);
  if (filters.size !== "any") p.set("size", filters.size);
  if (filters.energy !== "any") p.set("energy", filters.energy);
  if (filters.goodWithKids) p.set("goodWithKids", "true");
  if (filters.goodWithPets) p.set("goodWithPets", "true");
  if (prefs?.userLatitude && prefs?.userLongitude) {
    p.set("lat", prefs.userLatitude.toString());
    p.set("lng", prefs.userLongitude.toString());
    p.set("radius", filters.radius.toString());
  }
  return `/api/pets?${p}`;
}

export default function DiscoverPage() {
  const router = useRouter();
  const { sessionId, preferences, updatePreferences } = useLocalSession();

  const [pets, setPets] = useState<Pet[]>([]);
  const [index, setIndex] = useState(0);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  // Sync radius from preferences on mount
  useEffect(() => {
    if (preferences?.radiusMiles) {
      setFilters((f) => ({ ...f, radius: preferences.radiusMiles! }));
    }
  }, [preferences?.radiusMiles]);

  // Load pets
  useEffect(() => {
    if (!sessionId || !preferences) return;
    setLoading(true);
    setIndex(0);
    fetch(buildPetsUrl(sessionId, preferences, filters))
      .then((r) => r.json())
      .then((data) => { setPets(Array.isArray(data) ? data : []); setLoading(false); });
  }, [sessionId, preferences, filters]);

  // Pre-fetch compatibility for current pet
  useEffect(() => {
    if (!pets[index] || !preferences) return;
    setCompatibility(null);
    fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet: pets[index], preferences }),
    })
      .then((r) => r.json())
      .then(setCompatibility)
      .catch(() => {});
  }, [index, pets, preferences]);

  const swipe = useCallback(async (direction: "like" | "pass", alreadyAnimated = false) => {
    if (swiping || index >= pets.length) return;
    setSwiping(true);
    const pet = pets[index];
    if (!alreadyAnimated) setFlyDir(direction === "like" ? "right" : "left");

    if (sessionId) {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, petId: pet.id, direction }),
      });
    }

    await new Promise((r) => setTimeout(r, alreadyAnimated ? 50 : 350));
    setFlyDir(null);
    setIndex((i) => i + 1);
    setSwiping(false);
    if (direction === "like") setMatchedPet(pet);
  }, [swiping, index, pets, sessionId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (matchedPet) return;
      if (e.key === "ArrowRight") swipe("like");
      if (e.key === "ArrowLeft")  swipe("pass");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [swipe, matchedPet]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === "radius") {
      updatePreferences({ radiusMiles: value as number });
    }
  };

  const activeFilterCount = [
    filters.size !== "any",
    filters.energy !== "any",
    filters.goodWithKids,
    filters.goodWithPets,
    preferences?.userLatitude && filters.radius !== 50,
  ].filter(Boolean).length;

  if (loading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐾</div>
          <p className="text-gray-500 text-lg">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Let&apos;s set up your profile first</h2>
          <p className="text-gray-500 mb-6">Tell us about your lifestyle so we can find the best matches.</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors"
          >
            Get Started →
          </button>
        </div>
      </div>
    );
  }

  const done = index >= pets.length;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-4">
      {/* Header row */}
      <div className="w-full max-w-sm flex justify-between items-center mb-3">
        <div className="text-sm text-gray-400">
          {preferences.userLatitude ? (
            <span className="flex items-center gap-1">
              <span className="text-green-500">●</span>
              {pets.length} nearby
            </span>
          ) : (
            <span>{Math.max(0, pets.length - index)} pets remaining</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {compatibility && !done && (
            <span className="text-sm font-medium text-gray-600">
              {compatibility.emoji} {compatibility.label}
            </span>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
              showFilters || activeFilterCount > 0
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <span>⚙️</span> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-4 space-y-4">
          {preferences.userLatitude && (
            <div>
              <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>📍 Distance</span>
                <span className="text-brand-500">{filters.radius} miles</span>
              </label>
              <input
                type="range" min={10} max={100} step={10}
                value={filters.radius}
                onChange={(e) => updateFilter("radius", Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
            <div className="flex gap-1.5">
              {["any", "small", "medium", "large"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateFilter("size", s)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                    filters.size === s ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "any" ? "Any" : s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Energy</p>
            <div className="flex gap-1.5">
              {["any", "low", "medium", "high"].map((e) => (
                <button
                  key={e}
                  onClick={() => updateFilter("energy", e)}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                    filters.energy === e ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {e === "any" ? "Any" : e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateFilter("goodWithKids", !filters.goodWithKids)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                filters.goodWithKids
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              👶 Kid-friendly
            </button>
            <button
              onClick={() => updateFilter("goodWithPets", !filters.goodWithPets)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                filters.goodWithPets
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              🐕 Pet-friendly
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Card stack */}
      <div className="relative w-full max-w-sm" style={{ height: "520px" }}>
        {done ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;ve seen them all!</h2>
            <p className="text-gray-500 mb-6">
              {activeFilterCount > 0
                ? "Try clearing some filters to see more pets."
                : "Check your matches or list a pet waiting for a home."}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-colors mb-3"
              >
                Clear Filters
              </button>
            ) : null}
            <button
              onClick={() => router.push("/matches")}
              className="px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors"
            >
              ❤️ View Matches
            </button>
          </div>
        ) : (
          <>
            {[2, 1, 0].map((offset) => {
              const petIndex = index + offset;
              if (petIndex >= pets.length) return null;
              return (
                <PetCard
                  key={pets[petIndex].id}
                  pet={pets[petIndex]}
                  compatibility={offset === 0 ? compatibility ?? undefined : undefined}
                  flyDirection={offset === 0 ? flyDir : null}
                  isTop={offset === 0}
                  stackIndex={offset}
                  onSwipe={offset === 0 ? (dir) => swipe(dir === "right" ? "like" : "pass", true) : undefined}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Compatibility reason */}
      {compatibility && !done && (
        <p className="w-full max-w-sm text-center text-xs text-gray-400 mt-2 px-2 min-h-[2rem]">
          {compatibility.reason}
        </p>
      )}

      {/* Swipe buttons */}
      <div className="w-full max-w-sm mt-2">
        <SwipeButtons
          onLike={() => swipe("like")}
          onPass={() => swipe("pass")}
          disabled={done || swiping}
        />
      </div>

      {matchedPet && (
        <MatchModal
          pet={matchedPet}
          onClose={() => setMatchedPet(null)}
          onViewMatches={() => { setMatchedPet(null); router.push("/matches"); }}
        />
      )}
    </div>
  );
}
