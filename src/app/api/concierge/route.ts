import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const anthropic = new Anthropic();

const SYSTEM = `You are Petinder Concierge — Cairo's first AI pet care assistant.

You serve two segments:
- Segment A (premium): New Cairo, Zamalek, Maadi, Heliopolis — expect quality, speed, home visits
- Segment B (upper-middle): Nasr City, Mohandiseen, 6th October, Dokki — value-focused but quality-driven

You have access to LIVE tools — always use them when relevant:
- search_services: find vets, walkers, groomers, hotels, taxis — with real prices and WhatsApp numbers
- get_health_reminders: check a pet's vaccination and vet visit schedule, flag overdue or upcoming items
- get_available_slots: check which providers have real-time availability matching the user's preferred time

Cairo context you know:
- Payments: Cash on delivery, Vodafone Cash, InstaPay
- Traffic: allow 30–60 min buffer for any Cairo/Giza appointment
- Summer (Jun–Sept): walks should be before 8am or after 6pm due to heat
- Ramadan: evening slots fill fast; morning slots open up after Suhoor
- Most vets accept WhatsApp for quick consults
- Vaccination schedule (dogs): Rabies annually, DHPP every 1–3 years, Bordetella annually
- Vaccination schedule (cats): FVRCP annually or every 3 years, Rabies annually

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
        preferredTime: {
          type: "string",
          description: "User's preferred time, e.g. 'morning', 'evening', '8am'. Used to filter by provider schedule.",
        },
      },
      required: ["category"],
    },
  },
  {
    name: "get_health_reminders",
    description:
      "Look up a pet's health records and vaccination history. Returns upcoming due dates, overdue vaccinations, and recommended next vet visits based on pet age and breed.",
    input_schema: {
      type: "object" as const,
      properties: {
        petName: { type: "string", description: "The pet's name" },
        petId: { type: "string", description: "The pet's ID if known" },
        species: { type: "string", description: "Dog or cat" },
        ageMonths: { type: "number", description: "Pet age in months" },
      },
      required: [],
    },
  },
  {
    name: "get_available_slots",
    description:
      "Check which service providers are open and available at a specific time or day. Use when the user mentions a time preference like 'tomorrow morning', 'Friday afternoon', or 'this weekend'.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["all", "walks", "sitting", "vets", "grooming", "hotel", "taxi", "emergency"],
        },
        dayOfWeek: {
          type: "string",
          enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          description: "Day of week the user wants",
        },
        neighborhood: { type: "string" },
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

  return (filtered.length ? filtered : services).slice(0, 5).map((s) => ({
    title: s.title,
    provider: s.provider.name,
    neighborhood: s.provider.neighborhood,
    priceEGP: s.priceEGP,
    durationMins: s.durationMins,
    atHomeOnly: s.atHomeOnly,
    availableCount: (s as { availableCount?: number | null }).availableCount,
    rating: s.provider.rating,
    verified: s.provider.isVerified,
    whatsapp: s.provider.whatsapp,
  }));
}

async function runHealthReminders(args: { petName?: string; petId?: string; species?: string; ageMonths?: number }) {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (args.petId) {
    const records = await prisma.petHealthRecord.findMany({
      where: { petId: args.petId },
      orderBy: { date: "desc" },
    });
    const overdue = records.filter((r) => r.nextDueDate && r.nextDueDate < now);
    const upcoming = records.filter((r) => r.nextDueDate && r.nextDueDate >= now && r.nextDueDate <= in30Days);
    return { records: records.slice(0, 5), overdue, upcoming };
  }

  // Generic schedule based on species/age
  const reminders: string[] = [];
  if (args.species?.toLowerCase() === "dog") {
    reminders.push("Rabies vaccine — due annually");
    reminders.push("DHPP combo — due every 1–3 years");
    reminders.push("Bordetella (kennel cough) — due annually if boarding");
    if ((args.ageMonths ?? 0) < 12) reminders.push("Puppy series: DHPP at 8, 12, 16 weeks + Rabies at 16 weeks");
  } else if (args.species?.toLowerCase() === "cat") {
    reminders.push("FVRCP combo — due annually or every 3 years");
    reminders.push("Rabies vaccine — due annually");
    if ((args.ageMonths ?? 0) < 6) reminders.push("Kitten series: FVRCP at 8, 12, 16 weeks + spay/neuter at 5–6 months");
  }
  reminders.push("Annual wellness check with a vet");
  return { generalReminders: reminders };
}

async function runAvailableSlots(args: { category: string; dayOfWeek?: string; neighborhood?: string }) {
  const providers = await prisma.serviceProvider.findMany({
    where: { isApproved: true, suspendedAt: null },
    include: {
      services: {
        where: { isAvailable: true, ...(args.category !== "all" ? { category: args.category } : {}) },
        take: 2,
      },
    },
  });

  const available = providers
    .filter((p) => {
      if (!p.services.length) return false;
      if (args.neighborhood) {
        if (!p.neighborhood?.toLowerCase().includes(args.neighborhood.toLowerCase())) return false;
      }
      if (args.dayOfWeek && p.schedule) {
        const sched = p.schedule as Record<string, { on: boolean; from: string; to: string }>;
        const day = sched[args.dayOfWeek];
        if (!day?.on) return false;
      }
      return true;
    })
    .slice(0, 5)
    .map((p) => {
      const sched = p.schedule as Record<string, { on: boolean; from: string; to: string }> | null;
      const dayInfo = args.dayOfWeek && sched ? sched[args.dayOfWeek] : null;
      return {
        provider: p.name,
        neighborhood: p.neighborhood,
        whatsapp: p.whatsapp,
        rating: p.rating,
        services: p.services.map((s) => `${s.title} — ${s.priceEGP} EGP`),
        hours: dayInfo ? `${dayInfo.from}–${dayInfo.to}` : "Contact for hours",
        availableSlots: p.services.reduce((sum, s) => {
          const cnt = (s as { availableCount?: number | null }).availableCount;
          return sum + (cnt ?? 1);
        }, 0),
      };
    });

  return available;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    let response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 600,
      system: SYSTEM,
      tools: TOOLS,
      messages,
    });

    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const tu of toolUseBlocks) {
        let result: unknown;
        if (tu.name === "search_services") {
          const { category, neighborhood } = tu.input as { category: string; neighborhood?: string };
          result = await runServiceSearch(category, neighborhood);
        } else if (tu.name === "get_health_reminders") {
          result = await runHealthReminders(tu.input as { petName?: string; petId?: string; species?: string; ageMonths?: number });
        } else if (tu.name === "get_available_slots") {
          result = await runAvailableSlots(tu.input as { category: string; dayOfWeek?: string; neighborhood?: string });
        }
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: JSON.stringify(result) });
      }

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

    const text =
      (response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined)?.text ??
      "How can I help with your pet today? 🐾";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("concierge error:", err);
    return NextResponse.json({ reply: "Sorry, I'm having trouble connecting right now. Please try again in a moment 🙏" });
  }
}
