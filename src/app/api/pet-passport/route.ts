import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { petName, species, breed, gender, dobYear, vaccines, conditions, neighborhood } = data;

  const vaccineList = vaccines
    .filter((v: { name: string }) => v.name)
    .map((v: { name: string; date: string; nextDue: string }) =>
      `${v.name} (given: ${v.date || "unrecorded"}, next due: ${v.nextDue || "check with vet"})`
    )
    .join("; ");

  const prompt = `Generate a pet health passport summary for a ${species} named ${petName}.

Details:
- Breed: ${breed || "mixed"}
- Gender: ${gender}
- Birth year: ${dobYear || "unknown"}
- Location: ${neighborhood || "Cairo"}, Egypt
- Vaccines on record: ${vaccineList || "none recorded"}
- Medical conditions/allergies: ${conditions || "none noted"}

Return a JSON object with exactly these three fields:
{
  "summary": "<2-3 sentence warm health narrative about this pet's health status, tailored for Cairo climate and lifestyle>",
  "status": "<brief vaccine status label, e.g. 'Up to date', 'Booster needed', 'Overdue'>",
  "nextAction": "<single most important next health action, e.g. 'Annual checkup due', 'Rabies booster due'>"
}

Only return valid JSON. No markdown.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "{}";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;
    const result = JSON.parse(text.slice(start, end));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      summary: `${petName} is a healthy ${species} based in ${neighborhood || "Cairo"}. Regular check-ups and keeping vaccinations current are key to a long, happy life — especially during Cairo's hot summer months.`,
      status: "Check with vet",
      nextAction: "Schedule annual checkup",
    });
  }
}
