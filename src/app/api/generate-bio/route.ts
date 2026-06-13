import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { petId } = await req.json();

  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });

  const ageDisplay = pet.ageMonths < 12
    ? `${pet.ageMonths} months old`
    : `${Math.floor(pet.ageMonths / 12)} year${Math.floor(pet.ageMonths / 12) > 1 ? "s" : ""} old`;

  const prompt = `Write a charming, personality-filled bio for a rescue pet available for adoption.
Write it in first person FROM THE PET'S perspective. Be warm, funny, and endearing.
Make it feel like a real dating profile — the pet is trying to win over their forever family.
Keep it to 3 sentences maximum. No hashtags. No clichés like "I'm looking for my forever home."

Pet details:
- Name: ${pet.name}
- Species: ${pet.species}
- Breed: ${pet.breed}
- Age: ${ageDisplay}
- Gender: ${pet.gender}
- Size: ${pet.size}
- Energy level: ${pet.energyLevel}
- Good with kids: ${pet.goodWithKids}
- Good with other pets: ${pet.goodWithPets}
- Human description: ${pet.description}

Write only the bio, nothing else.`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 200,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const bio = message.content.find((b) => b.type === "text")?.text ?? pet.description;

  await prisma.pet.update({
    where: { id: petId },
    data: { aiBio: bio },
  });

  return NextResponse.json({ bio });
}
