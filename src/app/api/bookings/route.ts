import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    serviceId, sessionId, clientName, clientPhone,
    clientEmail, petName, petSpecies, notes, scheduledAt,
  } = body;

  if (!serviceId || !clientName || !clientPhone || !petName || !scheduledAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const booking = await prisma.booking.create({
    data: {
      serviceId,
      providerId: service.providerId,
      sessionId: sessionId || "guest",
      clientName,
      clientPhone,
      clientEmail,
      petName,
      petSpecies,
      notes,
      scheduledAt: new Date(scheduledAt),
    },
    include: { service: true, provider: true },
  });

  return NextResponse.json(booking, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json([], { status: 200 });

  const bookings = await prisma.booking.findMany({
    where: { sessionId },
    include: { service: true, provider: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
