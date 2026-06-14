import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const records = await prisma.petHealthRecord.findMany({
    where: { petId: params.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { type, title, date, nextDueDate, notes, providerName } = await req.json();
    if (!type || !title || !date) {
      return NextResponse.json({ error: "type, title, date required" }, { status: 400 });
    }
    const record = await prisma.petHealthRecord.create({
      data: {
        petId: params.id,
        type,
        title,
        date: new Date(date),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        notes: notes || null,
        providerName: providerName || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { recordId } = await req.json();
  await prisma.petHealthRecord.deleteMany({ where: { id: recordId, petId: params.id } });
  return NextResponse.json({ ok: true });
}
