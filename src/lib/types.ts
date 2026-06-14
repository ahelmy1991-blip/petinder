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
  latitude: number | null;
  longitude: number | null;
  isAvailable: boolean;
  adoptedAt: string | null;
  createdAt: string;
  distanceMiles?: number | null;
}

export interface UserPreferences {
  livingSpace: "apartment" | "house-no-yard" | "house-with-yard";
  activityLevel: "couch-potato" | "moderate" | "very-active";
  hasKids: boolean;
  hasPets: boolean;
  preferredSize: "small" | "medium" | "large" | "any";
  preferredSpecies: "dog" | "cat" | "any";
  experience: "first-time" | "some-experience" | "experienced";
  userLatitude?: number;
  userLongitude?: number;
  radiusMiles?: number;
}

export interface CompatibilityResult {
  score: number;
  emoji: string;
  label: string;
  reason: string;
}

export interface SwipeAction {
  petId: string;
  direction: "like" | "pass";
  sessionId: string;
}
