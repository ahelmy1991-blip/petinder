import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category     = searchParams.get("category");
  const neighborhood = searchParams.get("neighborhood");
  const atHome       = searchParams.get("atHome");
  const species      = searchParams.get("species");

  const where: Record<string, unknown> = { isAvailable: true };
  if (category && category !== "all") where.category = category;
  if (atHome === "true") where.atHomeOnly = true;
  if (species && species !== "all") where.species = { in: [species, "all"] };

  if (neighborhood) {
    where.provider = { neighborhood };
  }

  const services = await prisma.service.findMany({
    where,
    include: { provider: true },
    orderBy: [{ provider: { rating: "desc" } }, { priceEGP: "asc" }],
  });

  return NextResponse.json(services);
}
