import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pet = await prisma.pet.update({
      where: { id: params.id },
      data: { adoptedAt: new Date(), isAvailable: false },
    });
    return NextResponse.json(pet);
  } catch {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }
}
