"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { UserPreferences } from "@/lib/types";

const quizSteps = [
  {
    id: "species",
    question: "What kind of companion are you looking for?",
    emoji: "🐾",
    options: [
      { value: "dog", label: "Dogs 🐶", desc: "Loyal, active, always happy to see you" },
      { value: "cat", label: "Cats 🐱", desc: "Independent, elegant, surprisingly cuddly" },
      { value: "any", label: "Open to both 💕", desc: "Love wins, whatever it looks like" },
    ],
    key: "preferredSpecies",
  },
  {
    id: "living",
    question: "What's your living situation?",
    emoji: "🏠",
    options: [
      { value: "apartment", label: "Apartment", desc: "No outdoor space of my own" },
      { value: "house-no-yard", label: "House, no yard", desc: "Indoors-only outdoor access" },
      { value: "house-with-yard", label: "House with yard", desc: "Outdoor space to run and play" },
    ],
    key: "livingSpace",
  },
  {
    id: "activity",
    question: "How active is your lifestyle?",
    emoji: "🏃",
    options: [
      { value: "couch-potato", label: "Couch potato 🛋️", desc: "Netflix and chill is my sport" },
      { value: "moderate", label: "Moderate 🚶", desc: "Daily walks, occasional adventures" },
      { value: "very-active", label: "Very active 🏔️", desc: "Hikes, runs, outdoor lifestyle" },
    ],
    key: "activityLevel",
  },
  {
    id: "household",
    question: "Who's at home with you?",
    emoji: "👨‍👩‍👧",
    options: [
      { value: "none", label: "Just me (or adults only)", desc: "Quiet, adult-only household" },
      { value: "kids", label: "Kids at home 👶", desc: "Little ones need a pet-friendly friend" },
      { value: "both", label: "Kids + other pets 🐕🧒", desc: "The more the merrier" },
    ],
    key: "household",
  },
  {
    id: "size",
    question: "Any size preference?",
    emoji: "📏",
    options: [
      { value: "small", label: "Small 🐾", desc: "Under 20 lbs, lap-friendly" },
      { value: "medium", label: "Medium 🐕", desc: "20–60 lbs, the sweet spot" },
      { value: "large", label: "Large 🦮", desc: "60+ lbs, big love, big dog" },
      { value: "any", label: "Size doesn't matter 💝", desc: "Love has no size" },
    ],
    key: "preferredSize",
  },
  {
    id: "experience",
    question: "How experienced are you with pets?",
    emoji: "⭐",
    options: [
      { value: "first-time", label: "First-time owner", desc: "Never had a pet before — excited to start!" },
      { value: "some-experience", label: "Some experience", desc: "Had pets growing up or casual ownership" },
      { value: "experienced", label: "Experienced", desc: "Comfortable with training and complex needs" },
    ],
    key: "experience",
  },
];

const TOTAL_STEPS = quizSteps.length + 1; // +1 for location step

type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "skipped";

export default function LandingPage() {
  const router = useRouter();
  const { setPreferences } = useLocalSession();
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  // Location step state
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [radiusMiles, setRadiusMiles] = useState(50);
  const tempCoords = useRef<{ lat: number; lng: number } | null>(null);

  const isLocationStep = step === quizSteps.length;
  const currentStep = quizSteps[step];

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        tempCoords.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocationStatus("granted");
      },
      () => setLocationStatus("denied"),
      { timeout: 10000 }
    );
  };

  const handleNext = () => {
    if (!isLocationStep && !selected) return;

    if (!isLocationStep) {
      const newAnswers = { ...answers, [currentStep.key]: selected! };
      setAnswers(newAnswers);
      setSelected(null);
      setStep(step + 1);
      return;
    }

    // Location step — build final prefs and redirect
    const household = answers.household || "none";
    const prefs: UserPreferences = {
      preferredSpecies: (answers.preferredSpecies as UserPreferences["preferredSpecies"]) || "any",
      livingSpace: (answers.livingSpace as UserPreferences["livingSpace"]) || "apartment",
      activityLevel: (answers.activityLevel as UserPreferences["activityLevel"]) || "moderate",
      hasKids: household === "kids" || household === "both",
      hasPets: household === "both",
      preferredSize: (answers.preferredSize as UserPreferences["preferredSize"]) || "any",
      experience: (answers.experience as UserPreferences["experience"]) || "some-experience",
      ...(locationStatus === "granted" && tempCoords.current
        ? {
            userLatitude: tempCoords.current.lat,
            userLongitude: tempCoords.current.lng,
            radiusMiles,
          }
        : {}),
    };
    setPreferences(prefs);
    router.push("/discover");
  };

  // ─── Hero screen ────────────────────────────────────────────────────────────
  if (step === -1) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
        <div className="max-w-lg">
          <div className="text-8xl mb-6 animate-bounce">🐾</div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Find Your<br />
            <span className="text-brand-500">Perfect Match</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Swipe through rescue pets near you. Our AI finds animals that fit your lifestyle — not just your heart.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-2xl">🤖</span>
              <span>AI compatibility scoring</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-2xl">📍</span>
              <span>Location-based matching</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-2xl">❤️</span>
              <span>Real rescue animals</span>
            </div>
          </div>
          <button
            onClick={() => setStep(0)}
            className="px-10 py-4 bg-brand-500 hover:bg-brand-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Start Matching →
          </button>
          <p className="mt-4 text-sm text-gray-400">Takes 60 seconds • No account needed</p>
        </div>
      </div>
    );
  }

  // ─── Location step ───────────────────────────────────────────────────────────
  const locationBody = (
    <div className="space-y-4 mb-8">
      {locationStatus === "idle" && (
        <button
          onClick={requestLocation}
          className="w-full p-5 rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 text-center hover:border-brand-500 hover:shadow-md transition-all duration-200"
        >
          <div className="text-4xl mb-2">📍</div>
          <div className="font-semibold text-gray-900">Use My Location</div>
          <div className="text-sm text-gray-500 mt-1">Find rescue pets within your area</div>
        </button>
      )}

      {locationStatus === "requesting" && (
        <div className="text-center py-8">
          <div className="text-5xl mb-3 animate-pulse">📍</div>
          <p className="text-gray-600 font-medium">Getting your location...</p>
        </div>
      )}

      {locationStatus === "granted" && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-green-800 font-semibold">Location found!</p>
              <p className="text-green-600 text-sm">We&apos;ll show you pets nearby first.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
            <label className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Search radius</span>
              <span className="text-brand-500 font-bold">{radiusMiles} miles</span>
            </label>
            <input
              type="range"
              min={10} max={100} step={10}
              value={radiusMiles}
              onChange={(e) => setRadiusMiles(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 mi</span>
              <span>25 mi</span>
              <span>50 mi</span>
              <span>75 mi</span>
              <span>100 mi</span>
            </div>
          </div>
        </div>
      )}

      {locationStatus === "denied" && (
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-orange-800 font-semibold">Location unavailable</p>
            <p className="text-orange-600 text-sm">No worries — you can still browse all pets.</p>
          </div>
        </div>
      )}

      {locationStatus === "idle" && (
        <p className="text-center text-sm text-gray-400">
          Location is optional — you can always skip this step.
        </p>
      )}
    </div>
  );

  // ─── Quiz steps ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step + 1} of {TOTAL_STEPS}</span>
            <span>{Math.round(((step + 1) / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{isLocationStep ? "📍" : currentStep.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLocationStep ? "Find pets near you?" : currentStep.question}
          </h2>
          {isLocationStep && (
            <p className="text-gray-500 mt-2 text-sm">
              Allow location access to see rescue pets in your area first.
            </p>
          )}
        </div>

        {/* Options or location UI */}
        {isLocationStep ? (
          locationBody
        ) : (
          <div className="space-y-3 mb-8">
            {currentStep.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelected(opt.value)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  selected === opt.value
                    ? "border-brand-500 bg-brand-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm"
                }`}
              >
                <div className="font-semibold text-gray-900">{opt.label}</div>
                <div className="text-sm text-gray-500 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => { setStep(step - 1); setSelected(null); }}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-full hover:border-gray-400 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isLocationStep && !selected}
            className={`flex-1 py-3 rounded-full font-bold text-lg transition-all duration-200 ${
              isLocationStep || selected
                ? "bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLocationStep
              ? locationStatus === "granted"
                ? "Find My Match! 🐾"
                : "Skip & Browse All 🐾"
              : step === quizSteps.length - 1
              ? "Next →"
              : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
