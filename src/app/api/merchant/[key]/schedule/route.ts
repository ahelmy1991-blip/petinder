import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const p = await prisma.serviceProvider.findUnique({
    where: { merchantKey: params.key },
    select: { schedule: true },
  });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p.schedule ?? {});
}

export async function PATCH(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const p = await prisma.serviceProvider.findUnique({ where: { merchantKey: params.key } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const schedule = await req.json();
    await prisma.serviceProvider.update({ where: { id: p.id }, data: { schedule } });
    return NextResponse.json({ ok: true, schedule });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
