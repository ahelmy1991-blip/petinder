import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const p = await prisma.serviceProvider.findUnique({ where: { merchantKey: params.key } });
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const services = await prisma.service.findMany({
    where: { providerId: p.id },
    orderBy: [{ category: "asc" }, { priceEGP: "asc" }],
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const p = await prisma.serviceProvider.findUnique({ where: { merchantKey: params.key } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { category, title, description, priceEGP, durationMins, atHomeOnly, species, segment } = await req.json();
    if (!category || !title || !priceEGP) {
      return NextResponse.json({ error: "category, title, priceEGP required" }, { status: 400 });
    }

    const svc = await prisma.service.create({
      data: {
        providerId: p.id,
        category,
        title,
        description: description || "",
        priceEGP: Number(priceEGP),
        durationMins: durationMins ? Number(durationMins) : null,
        atHomeOnly: Boolean(atHomeOnly),
        species: species || "all",
        segment: segment || "B",
        isAvailable: true,
      },
    });
    return NextResponse.json(svc, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
