import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const messages = await prisma.message.findMany({
    where: { matchId: params.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { senderPetId, content } = await req.json();
    if (!senderPetId || !content?.trim()) {
      return NextResponse.json({ error: "senderPetId and content required" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: params.id } });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.pet1Id !== senderPetId && match.pet2Id !== senderPetId) {
      return NextResponse.json({ error: "Not a participant in this match" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { matchId: params.id, senderPetId, content: content.trim() },
    });

    // Mark other pet's unread messages as read
    await prisma.message.updateMany({
      where: { matchId: params.id, senderPetId: { not: senderPetId }, read: false },
      data: { read: true },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
