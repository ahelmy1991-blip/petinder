import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_KEY;
}

/**
 * Universal admin override endpoint.
 * Body: { entity, id, action, data }
 * entity: "pet" | "provider" | "service" | "booking"
 * action: "update" | "delete" | "approve" | "suspend" | "unsuspend" | "verify"
 */
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { entity, id, action, data } = await req.json();
    if (!entity || !id || !action) {
      return NextResponse.json({ error: "entity, id, action required" }, { status: 400 });
    }

    let result: unknown;

    if (entity === "pet") {
      if (action === "delete") {
        await prisma.swipe.deleteMany({ where: { petId: id } });
        result = await prisma.pet.delete({ where: { id } });
      } else if (action === "update") {
        result = await prisma.pet.update({ where: { id }, data });
      } else if (action === "adopt") {
        result = await prisma.pet.update({ where: { id }, data: { isAvailable: false, adoptedAt: new Date() } });
      } else if (action === "unadopt") {
        result = await prisma.pet.update({ where: { id }, data: { isAvailable: true, adoptedAt: null } });
      }
    } else if (entity === "provider") {
      if (action === "delete") {
        result = await prisma.serviceProvider.delete({ where: { id } });
      } else if (action === "update") {
        result = await prisma.serviceProvider.update({ where: { id }, data });
      } else if (action === "approve") {
        result = await prisma.serviceProvider.update({ where: { id }, data: { isApproved: true, suspendedAt: null } });
      } else if (action === "suspend") {
        result = await prisma.serviceProvider.update({ where: { id }, data: { isApproved: false, suspendedAt: new Date() } });
      } else if (action === "verify") {
        result = await prisma.serviceProvider.update({ where: { id }, data: { isVerified: !data?.current } });
      }
    } else if (entity === "service") {
      if (action === "delete") {
        result = await prisma.service.delete({ where: { id } });
      } else if (action === "update") {
        result = await prisma.service.update({ where: { id }, data });
      } else if (action === "toggle") {
        const svc = await prisma.service.findUnique({ where: { id } });
        result = await prisma.service.update({ where: { id }, data: { isAvailable: !svc?.isAvailable } });
      }
    } else if (entity === "booking") {
      if (action === "update") {
        result = await prisma.booking.update({ where: { id }, data });
      } else if (action === "cancel") {
        result = await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
      } else if (action === "confirm") {
        result = await prisma.booking.update({ where: { id }, data: { status: "confirmed" } });
      } else if (action === "complete") {
        result = await prisma.booking.update({ where: { id }, data: { status: "completed" } });
      } else if (action === "delete") {
        result = await prisma.booking.delete({ where: { id } });
      }
    }

    if (result === undefined) {
      return NextResponse.json({ error: "Unknown entity/action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Override failed", detail: String(e) }, { status: 500 });
  }
}
