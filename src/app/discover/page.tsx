"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PetCard from "@/components/PetCard";
import SwipeButtons from "@/components/SwipeButtons";
import MatchModal from "@/components/MatchModal";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { Pet, CompatibilityResult } from "@/lib/types";

export default function DiscoverPage() {
  const router = useRouter();
  const { sessionId, preferences } = useLocalSession();

  const [pets, setPets] = useState<Pet[]>([]);
  const [index, setIndex] = useState(0);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [swiping, setSwiping] = useState(false);

  // Load pets once session is ready
  useEffect(() => {
    if (!sessionId) return;
    const speciesParam = preferences?.preferredSpecies !== "any"
      ? `&species=${preferences?.preferredSpecies}`
      : "";
    fetch(`/api/pets?sessionId=${sessionId}${speciesParam}`)
      .then((r) => r.json())
      .then((data) => {
        setPets(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [sessionId, preferences]);

  // Pre-fetch compatibility for current pet
  useEffect(() => {
    if (!pets[index] || !preferences || !sessionId) return;
    setCompatibility(null);
    fetch("/api/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet: pets[index], preferences }),
    })
      .then((r) => r.json())
      .then(setCompatibility)
      .catch(() => {});
  }, [index, pets, preferences, sessionId]);

  const swipe = useCallback(async (direction: "like" | "pass") => {
    if (swiping || index >= pets.length) return;
    setSwiping(true);
    const pet = pets[index];
    setFlyDir(direction === "like" ? "right" : "left");

    // Record swipe in DB
    if (sessionId) {
      await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, petId: pet.id, direction }),
      });
    }

    // Show match modal if liked
    await new Promise((r) => setTimeout(r, 350));
    setFlyDir(null);
    setIndex((i) => i + 1);
    setSwiping(false);

    if (direction === "like") {
      setMatchedPet(pet);
    }
  }, [swiping, index, pets, sessionId]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (matchedPet) return;
      if (e.key === "ArrowRight") swipe("like");
      if (e.key === "ArrowLeft")  swipe("pass");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [swipe, matchedPet]);

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
          <p className="text-gray-500 mb-6">Tell us a bit about your lifestyle so we can find the best matches.</p>
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
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] px-4 py-4">
      {/* Counter */}
      <div className="w-full max-w-sm flex justify-between items-center text-sm text-gray-400 mb-2">
        <span>{Math.max(0, pets.length - index)} pets remaining</span>
        {compatibility && (
          <span className="flex items-center gap-1 font-medium text-gray-600">
            {compatibility.emoji} {compatibility.label}
          </span>
        )}
      </div>

      {/* Card stack */}
      <div className="relative w-full max-w-sm" style={{ height: "520px" }}>
        {done ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white rounded-3xl shadow-xl p-8">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;ve seen them all!</h2>
            <p className="text-gray-500 mb-6">Check your matches or list a pet waiting for a home.</p>
            <button
              onClick={() => router.push("/matches")}
              className="px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-colors"
            >
              ❤️ View Matches
            </button>
          </div>
        ) : (
          <>
            {/* Render up to 3 cards in the stack */}
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
      <div className="w-full max-w-sm">
        <SwipeButtons
          onLike={() => swipe("like")}
          onPass={() => swipe("pass")}
          disabled={done || swiping}
        />
      </div>

      {/* Match modal */}
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
