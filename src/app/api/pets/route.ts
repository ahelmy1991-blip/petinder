import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const species = searchParams.get("species");

  // Get IDs of pets already swiped by this session
  const swipedIds = sessionId
    ? (await prisma.swipe.findMany({
        where: { sessionId },
        select: { petId: true },
      })).map((s) => s.petId)
    : [];

  const pets = await prisma.pet.findMany({
    where: {
      isAvailable: true,
      id: { notIn: swipedIds },
      ...(species && species !== "any" ? { species } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json(pets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, species, breed, ageMonths, gender, size, energyLevel,
          goodWithKids, goodWithPets, description, photoUrl,
          shelterName, shelterEmail, location } = body;

  if (!name || !species || !breed || !shelterEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      name, species, breed,
      ageMonths: Number(ageMonths),
      gender, size, energyLevel,
      goodWithKids: Boolean(goodWithKids),
      goodWithPets: Boolean(goodWithPets),
      description,
      photoUrl: photoUrl || `https://loremflickr.com/400/600/${species}`,
      shelterName, shelterEmail, location,
    },
  });

  return NextResponse.json(pet, { status: 201 });
}
