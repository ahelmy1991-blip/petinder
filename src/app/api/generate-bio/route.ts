import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { petId } = await req.json();
    if (!petId) return NextResponse.json({ error: "petId required" }, { status: 400 });

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

    const ageDisplay = pet.ageMonths < 12
      ? `${pet.ageMonths} months old`
      : `${Math.floor(pet.ageMonths / 12)} year${Math.floor(pet.ageMonths / 12) > 1 ? "s" : ""} old`;

    const prompt = `Write a charming, personality-filled bio for a rescue pet available for adoption.
Write it in FIRST PERSON from the PET's perspective — funny, warm, endearing.
Make it feel like a real dating profile: the pet is "selling themselves" to win over their forever family.
Keep it to 2–3 punchy sentences. No hashtags. Avoid clichés like "looking for my forever home."

Pet details:
- Name: ${pet.name}
- Species: ${pet.species} | Breed: ${pet.breed} | Age: ${ageDisplay}
- Size: ${pet.size} | Energy: ${pet.energyLevel} | Gender: ${pet.gender}
- Good with kids: ${pet.goodWithKids} | Good with pets: ${pet.goodWithPets}
- Location: ${pet.location}
- Original description: ${pet.description}

Write ONLY the bio text, nothing else.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const bio = (message.content.find((b) => b.type === "text") as { type: "text"; text: string } | undefined)?.text ?? pet.description;

    await prisma.pet.update({ where: { id: petId }, data: { aiBio: bio } });

    return NextResponse.json({ bio });
  } catch (err) {
    console.error("generate-bio error:", err);
    return NextResponse.json({ error: "Failed to generate bio" }, { status: 500 });
  }
}
