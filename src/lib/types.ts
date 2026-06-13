export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  ageMonths: number;
  gender: string;
  size: string;
  energyLevel: string;
  goodWithKids: boolean;
  goodWithPets: boolean;
  description: string;
  aiBio: string | null;
  photoUrl: string;
  shelterName: string;
  shelterEmail: string;
  location: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface UserPreferences {
  livingSpace: "apartment" | "house-no-yard" | "house-with-yard";
  activityLevel: "couch-potato" | "moderate" | "very-active";
  hasKids: boolean;
  hasPets: boolean;
  preferredSize: "small" | "medium" | "large" | "any";
  preferredSpecies: "dog" | "cat" | "any";
  experience: "first-time" | "some-experience" | "experienced";
}

export interface CompatibilityResult {
  score: number;       // 0–100
  emoji: string;       // visual indicator
  label: string;       // "Perfect Match" | "Great Match" | etc.
  reason: string;      // 1-2 sentence explanation
}

export interface SwipeAction {
  petId: string;
  direction: "like" | "pass";
  sessionId: string;
}
