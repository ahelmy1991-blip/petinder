"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalSession } from "@/hooks/useLocalSession";
import type { UserPreferences } from "@/lib/types";

const steps = [
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

export default function LandingPage() {
  const router = useRouter();
  const { setPreferences } = useLocalSession();
  const [step, setStep] = useState(-1);  // -1 = hero screen
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const currentStep = steps[step];

  const handleSelect = (value: string) => {
    setSelected(value);
  };

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [currentStep.key]: selected };
    setAnswers(newAnswers);
    setSelected(null);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Build preferences and redirect
      const household = newAnswers.household || "none";
      const prefs: UserPreferences = {
        preferredSpecies: (newAnswers.preferredSpecies as UserPreferences["preferredSpecies"]) || "any",
        livingSpace: (newAnswers.livingSpace as UserPreferences["livingSpace"]) || "apartment",
        activityLevel: (newAnswers.activityLevel as UserPreferences["activityLevel"]) || "moderate",
        hasKids: household === "kids" || household === "both",
        hasPets: household === "both",
        preferredSize: (newAnswers.preferredSize as UserPreferences["preferredSize"]) || "any",
        experience: (newAnswers.experience as UserPreferences["experience"]) || "some-experience",
      };
      setPreferences(prefs);
      router.push("/discover");
    }
  };

  // Hero screen
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
              <span className="text-2xl">🏠</span>
              <span>Lifestyle-matched pets</span>
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

  // Quiz steps
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{currentStep.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{currentStep.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentStep.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
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
            disabled={!selected}
            className={`flex-1 py-3 rounded-full font-bold text-lg transition-all duration-200 ${
              selected
                ? "bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg transform hover:scale-105"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {step === steps.length - 1 ? "Find My Match! 🐾" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
