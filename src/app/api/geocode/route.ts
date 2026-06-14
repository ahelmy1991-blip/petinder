import { NextRequest, NextResponse } from "next/server";
import { geocodeAddress } from "@/lib/geo";

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({ error: "Address required" }, { status: 400 });

  const result = await geocodeAddress(address);
  if (!result) return NextResponse.json({ error: "Could not geocode address" }, { status: 404 });

  return NextResponse.json(result);
}
