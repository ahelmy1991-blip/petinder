import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pet = await prisma.pet.findUnique({ where: { id: params.id } });
  if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pet);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const pet = await prisma.pet.update({ where: { id: params.id }, data: body });
  return NextResponse.json(pet);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.pet.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
