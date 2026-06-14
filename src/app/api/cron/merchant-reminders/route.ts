import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vercel Cron hits this at 6am UTC (= 8am Cairo EET)
// Protected by CRON_SECRET env var set in Vercel dashboard
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Find providers whose catalog is stale (no update in 7 days, or never updated)
  const staleProviders = await prisma.serviceProvider.findMany({
    where: {
      isApproved: true,
      suspendedAt: null,
      merchantKey: { not: null },
      OR: [
        { catalogUpdatedAt: null },
        { catalogUpdatedAt: { lt: sevenDaysAgo } },
      ],
    },
    select: { id: true, name: true, email: true, catalogUpdatedAt: true },
  });

  let created = 0;
  for (const p of staleProviders) {
    const daysSince = p.catalogUpdatedAt
      ? Math.floor((Date.now() - p.catalogUpdatedAt.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const message = daysSince
      ? `Your catalog hasn't been updated in ${daysSince} days. Review your services, prices, and availability to stay visible to pet owners.`
      : `Welcome! Complete your catalog by adding services, setting prices, and enabling your schedule to start receiving bookings.`;

    await prisma.merchantNotification.create({
      data: {
        providerId: p.id,
        type: "catalog_reminder",
        message,
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, reminders_sent: created, stale_providers: staleProviders.length });
}
