import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const provider = await prisma.serviceProvider.findFirst({
      where: { email: email.trim().toLowerCase() },
      select: { merchantKey: true, name: true, id: true },
    });

    if (!provider || !provider.merchantKey) {
      return NextResponse.json({ error: "No merchant account found for this email" }, { status: 404 });
    }

    return NextResponse.json({ merchantKey: provider.merchantKey, name: provider.name });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
