import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { sessionId, petId, direction } = await req.json();

  if (!sessionId || !petId || !["like", "pass"].includes(direction)) {
    return NextResponse.json({ error: "Invalid swipe data" }, { status: 400 });
  }

  // Upsert — if they somehow swipe the same pet twice, just update direction
  const swipe = await prisma.swipe.upsert({
    where: { sessionId_petId: { sessionId, petId } },
    update: { direction },
    create: { sessionId, petId, direction },
  });

  return NextResponse.json({ ok: true, swipe });
}
