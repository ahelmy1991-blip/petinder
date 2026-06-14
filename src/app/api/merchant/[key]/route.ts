import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getProvider(key: string) {
  return prisma.serviceProvider.findUnique({
    where: { merchantKey: key },
    include: {
      services: { orderBy: { category: "asc" } },
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { service: { select: { title: true, priceEGP: true } } },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { bookings: true, services: true } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  const p = await getProvider(params.key);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Never expose passwordHash to client
  const { passwordHash: _, ...safe } = p as typeof p & { passwordHash?: string };
  void _;
  return NextResponse.json(safe);
}

export async function PATCH(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const p = await prisma.serviceProvider.findUnique({ where: { merchantKey: params.key } });
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const allowed = ["name", "bio", "avatarEmoji", "location", "neighborhood", "whatsapp", "email", "rating"];
    const data: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) data[k] = body[k];

    const updated = await prisma.serviceProvider.update({ where: { id: p.id }, data });
    const { passwordHash: _ph, ...safe } = updated as typeof updated & { passwordHash?: string };
    void _ph;
    return NextResponse.json(safe);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
