import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const likedSwipes = await prisma.swipe.findMany({
    where: { sessionId, direction: "like" },
    include: { pet: true },
    orderBy: { createdAt: "desc" },
  });

  const matches = likedSwipes.map((s) => s.pet);
  return NextResponse.json(matches);
}
