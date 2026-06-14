import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { haversineDistance, geocodeAddress } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") ?? "";
  const species   = searchParams.get("species");
  const size      = searchParams.get("size");
  const energy    = searchParams.get("energy");
  const goodWithKids = searchParams.get("goodWithKids");
  const goodWithPets = searchParams.get("goodWithPets");
  const ageMinRaw = searchParams.get("ageMin");
  const ageMaxRaw = searchParams.get("ageMax");
  const latRaw    = searchParams.get("lat");
  const lngRaw    = searchParams.get("lng");
  const radiusRaw = searchParams.get("radius");

  const userLat = latRaw ? parseFloat(latRaw) : undefined;
  const userLng = lngRaw ? parseFloat(lngRaw) : undefined;
  const radius  = radiusRaw ? parseFloat(radiusRaw) : undefined;

  const swipedIds = sessionId
    ? (await prisma.swipe.findMany({ where: { sessionId }, select: { petId: true } })).map(
        (s) => s.petId
      )
    : [];

  const where: Record<string, unknown> = {
    isAvailable: true,
    adoptedAt: null,
    id: { notIn: swipedIds },
  };

  if (species && species !== "any") where.species = species;
  if (size && size !== "any") where.size = size;
  if (energy && energy !== "any") where.energyLevel = energy;
  if (goodWithKids === "true") where.goodWithKids = true;
  if (goodWithPets === "true") where.goodWithPets = true;

  if (ageMinRaw || ageMaxRaw) {
    const ageFilter: Record<string, number> = {};
    if (ageMinRaw) ageFilter.gte = parseInt(ageMinRaw);
    if (ageMaxRaw) ageFilter.lte = parseInt(ageMaxRaw);
    where.ageMonths = ageFilter;
  }

  let pets = await prisma.pet.findMany({ where, orderBy: { createdAt: "asc" }, take: 100 });

  // Prioritise local dog photos (from the real Cairo rescue folder) over remote Unsplash images
  pets = [...pets.filter(p => p.photoUrl.startsWith("/")), ...pets.filter(p => !p.photoUrl.startsWith("/")),];

  if (userLat !== undefined && userLng !== undefined && radius !== undefined) {
    const withDist = pets
      .map((pet) => ({
        ...pet,
        distanceMiles:
          pet.latitude != null && pet.longitude != null
            ? haversineDistance(userLat, userLng, pet.latitude, pet.longitude)
            : null,
      }))
      .filter((p) => p.distanceMiles == null || p.distanceMiles <= radius)
      .sort((a, b) => (a.distanceMiles ?? 9999) - (b.distanceMiles ?? 9999));

    return NextResponse.json(
      withDist.slice(0, 50).map((p) => ({
        ...p,
        distanceMiles: p.distanceMiles != null ? Math.round(p.distanceMiles) : null,
      }))
    );
  }

  return NextResponse.json(pets.slice(0, 50));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name, species, breed, ageMonths, gender, size, energyLevel,
    goodWithKids, goodWithPets, description, photoUrl,
    shelterName, shelterEmail, location,
  } = body;

  if (!name || !species || !breed || !shelterEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  if (location) {
    const coords = await geocodeAddress(location);
    if (coords) { latitude = coords.lat; longitude = coords.lng; }
  }

  const fallback: Record<string, string> = {
    dog: "https://placedog.net/600/400?random",
    cat: "https://cataas.com/cat?width=600&height=400",
  };

  const pet = await prisma.pet.create({
    data: {
      name, species, breed,
      ageMonths: Number(ageMonths) || 12,
      gender: gender || "Unknown",
      size: size || "medium",
      energyLevel: energyLevel || "medium",
      goodWithKids: Boolean(goodWithKids),
      goodWithPets: Boolean(goodWithPets),
      description: description || "",
      photoUrl: photoUrl || fallback[species] || "https://placedog.net/600/400",
      shelterName: shelterName || "Local Shelter",
      shelterEmail,
      location: location || "",
      latitude,
      longitude,
    },
  });

  return NextResponse.json(pet, { status: 201 });
}
