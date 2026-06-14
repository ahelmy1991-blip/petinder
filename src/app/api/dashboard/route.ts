import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const pets = await prisma.pet.findMany({
    where: { shelterEmail: email.toLowerCase() },
    include: {
      _count: { select: { swipes: { where: { direction: "like" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pets);
}
