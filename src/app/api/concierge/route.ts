import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const anthropic = new Anthropic();

const SYSTEM = `You are Petinder Concierge — Cairo's first AI pet care assistant.

You serve two segments:
- Segment A (premium): New Cairo, Zamalek, Maadi, Heliopolis — expect quality, speed, home visits
- Segment B (upper-middle): Nasr City, Mohandiseen, 6th October, Dokki — value-focused but quality-driven

You have access to a LIVE tool: search_services — use it whenever someone asks about services, providers, prices, availability, or bookings. Do NOT make up prices; always pull them from the tool.

Cairo context you know:
- Payments: Cash on delivery, Vodafone Cash, InstaPay
- Traffic: allow 30–60 min buffer for any Cairo/Giza appointment
- Summer (Jun–Sept): walks should be before 8am or after 6pm due to heat
- Ramadan: evening slots fill fast; morning slots open up after Suhoor
- Most vets accept WhatsApp for quick consults

Be warm, concise (under 160 words), and actionable. End responses with a relevant emoji.
If asked in Arabic, reply fully in Arabic.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_services",
    description:
      "Search Petinder's live Cairo marketplace database for pet service providers. Returns real providers, real prices, and WhatsApp numbers. Always use this when the user asks about services, prices, vets, walkers, groomers, hotels, or taxis.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["all", "walks", "sitting", "vets", "grooming", "hotel", "taxi", "emergency"],
          description: "Service category to search. Use 'all' if the user hasn't specified.",
        },
        neighborhood: {
          type: "string",
          description: "Preferred Cairo neighborhood. Omit to search all areas.",
        },
      },
      required: ["category"],
    },
  },
];

async function runServiceSearch(category: string, neighborhood?: string) {
  const where: Record<string, unknown> = { isAvailable: true };
  if (category && category !== "all") where.category = category;

  const services = await prisma.service.findMany({
    where,
    include: { provider: true },
    take: 6,
    orderBy: { priceEGP: "asc" },
  });

  const filtered = neighborhood && neighborhood !== "All Areas"
    ? services.filter((s) =>
        s.provider.neighborhood?.toLowerCase().includes(neighborhood.toLowerCase())
      )
    : services;

  const list = (filtered.length ? filtered : services).slice(0, 5);

  return list.map((s) => ({
    title: s.title,
    provider: s.provider.name,
    neighborhood: s.provider.neighborhood,
    priceEGP: s.priceEGP,
    durationMins: s.durationMins,
    atHomeOnly: s.atHomeOnly,
    rating: s.provider.rating,
    verified: s.provider.isVerified,
    whatsapp: s.provider.whatsapp,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    // First call — may include tool use
    let response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    // Agentic tool loop
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const tu of toolUseBlocks) {
        if (tu.name === "search_services") {
          const { category, neighborhood } = tu.input as { category: string; neighborhood?: string };
          const results = await runServiceSearch(category, neighborhood);
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: JSON.stringify(results),
          });
        }
      }

      // Second call with tool results
      response = await anthropic.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 600,
        system: SYSTEM,
        tools: TOOLS,
        messages: [
          ...messages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
      });
    }

    const text = (response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined)?.text
      ?? "How can I help with your pet today? 🐾";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("concierge error:", err);
    return NextResponse.json({ reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment 🙏" });
  }
}
