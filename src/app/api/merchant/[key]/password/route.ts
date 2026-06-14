import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { merchantKey: params.key },
      select: { id: true, passwordHash: true },
    });
    if (!provider) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If password already set, require current password to change it
    if (provider.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password required" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, provider.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
