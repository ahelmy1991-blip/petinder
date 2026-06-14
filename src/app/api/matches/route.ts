import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const petId = searchParams.get("petId");

  // Existing: liked pets for a swipe session
  if (sessionId) {
    const likedSwipes = await prisma.swipe.findMany({
      where: { sessionId, direction: "like" },
      include: { pet: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(likedSwipes.map((s) => s.pet));
  }

  // New: pet-to-pet matches for messaging
  if (petId) {
    const matches = await prisma.match.findMany({
      where: { OR: [{ pet1Id: petId }, { pet2Id: petId }] },
      include: {
        pet1: { select: { id: true, name: true, breed: true, photoUrl: true, location: true } },
        pet2: { select: { id: true, name: true, breed: true, photoUrl: true, location: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { matchedAt: "desc" },
    });
    return NextResponse.json(matches);
  }

  return NextResponse.json({ error: "sessionId or petId required" }, { status: 400 });
}

// Create a match between two pets (called when a mutual like occurs)
export async function POST(req: NextRequest) {
  try {
    const { pet1Id, pet2Id } = await req.json();
    if (!pet1Id || !pet2Id || pet1Id === pet2Id) {
      return NextResponse.json({ error: "Two different petIds required" }, { status: 400 });
    }

    // Canonical ordering to avoid duplicates
    const [a, b] = [pet1Id, pet2Id].sort();

    const match = await prisma.match.upsert({
      where: { pet1Id_pet2Id: { pet1Id: a, pet2Id: b } },
      create: { pet1Id: a, pet2Id: b },
      update: {},
      include: {
        pet1: { select: { id: true, name: true, photoUrl: true } },
        pet2: { select: { id: true, name: true, photoUrl: true } },
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
