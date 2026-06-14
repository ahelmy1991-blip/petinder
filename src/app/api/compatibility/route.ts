import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { UserPreferences, CompatibilityResult } from "@/lib/types";

const anthropic = new Anthropic();

function scoreLabel(score: number): { emoji: string; label: string } {
  if (score >= 90) return { emoji: "💘", label: "Perfect Match" };
  if (score >= 75) return { emoji: "❤️", label: "Great Match" };
  if (score >= 60) return { emoji: "🧡", label: "Good Match" };
  if (score >= 40) return { emoji: "💛", label: "Possible Match" };
  return { emoji: "🤍", label: "Might Be Tricky" };
}

export async function POST(req: NextRequest) {
  const { pet, preferences }: { pet: Record<string, unknown>; preferences: UserPreferences } =
    await req.json();

  const prompt = `Score the compatibility between a potential adopter and a rescue pet. Return JSON only.

Adopter profile:
- Living space: ${preferences.livingSpace}
- Activity level: ${preferences.activityLevel}
- Has kids: ${preferences.hasKids}
- Has other pets: ${preferences.hasPets}
- Preferred size: ${preferences.preferredSize}
- Experience level: ${preferences.experience}

Pet profile:
- Name: ${pet.name}
- Species: ${pet.species}
- Breed: ${pet.breed}
- Age: ${pet.ageMonths} months
- Size: ${pet.size}
- Energy level: ${pet.energyLevel}
- Good with kids: ${pet.goodWithKids}
- Good with other pets: ${pet.goodWithPets}

Return ONLY valid JSON in this exact format:
{"score": <0-100>, "reason": "<1 concise sentence explaining the match quality>"}

Score 90-100: near-perfect lifestyle match
Score 70-89: good match with minor considerations
Score 50-69: workable match but some compromises needed
Score 30-49: potential mismatch — proceed thoughtfully
Score 0-29: significant mismatch`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    const parsed = JSON.parse(text.slice(start, end));

    const score = Math.max(0, Math.min(100, Number(parsed.score)));
    const { emoji, label } = scoreLabel(score);

    const result: CompatibilityResult = {
      score,
      emoji,
      label,
      reason: parsed.reason ?? "Compatibility calculated based on your lifestyle.",
    };

    return NextResponse.json(result);
  } catch {
    const fallback: CompatibilityResult = {
      score: 70,
      emoji: "❤️",
      label: "Good Match",
      reason: "Based on your preferences, this could be a great fit.",
    };
    return NextResponse.json(fallback);
  }
}
