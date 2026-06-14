import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function verifyOwnership(key: string, serviceId: string) {
  const p = await prisma.serviceProvider.findUnique({ where: { merchantKey: key } });
  if (!p) return null;
  const svc = await prisma.service.findFirst({ where: { id: serviceId, providerId: p.id } });
  return svc ? p : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { key: string; serviceId: string } }
) {
  try {
    const owner = await verifyOwnership(params.key, params.serviceId);
    if (!owner) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    const body = await req.json();
    const allowed = ["title", "description", "priceEGP", "durationMins", "atHomeOnly", "isAvailable", "category", "species", "segment"];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (k in body) {
        if (k === "priceEGP" || k === "durationMins") data[k] = body[k] ? Number(body[k]) : null;
        else if (k === "atHomeOnly" || k === "isAvailable") data[k] = Boolean(body[k]);
        else data[k] = body[k];
      }
    }

    const updated = await prisma.service.update({ where: { id: params.serviceId }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { key: string; serviceId: string } }
) {
  try {
    const owner = await verifyOwnership(params.key, params.serviceId);
    if (!owner) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    await prisma.service.delete({ where: { id: params.serviceId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
