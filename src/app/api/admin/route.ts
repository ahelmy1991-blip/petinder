import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [pets, providers, services, bookings, swipes] = await Promise.all([
    prisma.pet.aggregate({ _count: true, where: {} }),
    prisma.serviceProvider.aggregate({ _count: true }),
    prisma.service.aggregate({ _count: true, _avg: { priceEGP: true } }),
    prisma.booking.aggregate({ _count: true }),
    prisma.swipe.aggregate({ _count: true }),
  ]);

  const recentBookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true, priceEGP: true, category: true } },
      provider: { select: { name: true, neighborhood: true } },
    },
  });

  const topPets = await prisma.pet.findMany({
    take: 5,
    orderBy: { swipes: { _count: "desc" } },
    select: { id: true, name: true, breed: true, photoUrl: true, _count: { select: { swipes: true } } },
  });

  const allProviders = await prisma.serviceProvider.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { services: true, bookings: true } },
    },
  });

  const allServices = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
    include: { provider: { select: { name: true, neighborhood: true } } },
  });

  const allPets = await prisma.pet.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { swipes: true } } },
  });

  const allBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { title: true, priceEGP: true, category: true } },
      provider: { select: { name: true, neighborhood: true } },
    },
  });

  const pendingRevenue = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.service?.priceEGP ?? 0), 0);

  return NextResponse.json({
    stats: {
      totalPets: pets._count,
      totalProviders: providers._count,
      totalServices: services._count,
      totalBookings: bookings._count,
      totalSwipes: swipes._count,
      avgServicePrice: Math.round(services._avg.priceEGP ?? 0),
      pendingRevenue,
    },
    recentBookings,
    topPets,
    allProviders,
    allServices,
    allPets,
    allBookings,
  });
}
