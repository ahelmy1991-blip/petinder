import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

function genKey(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6);
  const rand = randomBytes(3).toString("hex");
  return `${slug}-${rand}`;
}

const DEFAULT_SCHEDULE = {
  mon: { on: true,  from: "08:00", to: "20:00" },
  tue: { on: true,  from: "08:00", to: "20:00" },
  wed: { on: true,  from: "08:00", to: "20:00" },
  thu: { on: true,  from: "08:00", to: "20:00" },
  fri: { on: false, from: "08:00", to: "20:00" },
  sat: { on: true,  from: "10:00", to: "16:00" },
  sun: { on: false, from: "08:00", to: "20:00" },
  overrides: {} as Record<string, { on: boolean; note?: string; from?: string; to?: string }>,
};

export async function POST(req: NextRequest) {
  try {
    const { name, bio, avatarEmoji, location, neighborhood, whatsapp, email } = await req.json();
    if (!name || !email || !neighborhood) {
      return NextResponse.json({ error: "name, email, neighborhood required" }, { status: 400 });
    }

    // If email already registered, return existing key
    const existing = await prisma.serviceProvider.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ merchantKey: existing.merchantKey, existing: true });
    }

    const merchantKey = genKey(name);
    const provider = await prisma.serviceProvider.create({
      data: {
        name,
        bio: bio || "",
        avatarEmoji: avatarEmoji || "🐾",
        location: location || neighborhood + ", Cairo",
        neighborhood,
        whatsapp: whatsapp || "",
        email,
        merchantKey,
        schedule: DEFAULT_SCHEDULE,
        isApproved: true,
        isVerified: false,
        rating: 5.0,
        reviewCount: 0,
      },
    });

    return NextResponse.json({ merchantKey: provider.merchantKey, providerId: provider.id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
