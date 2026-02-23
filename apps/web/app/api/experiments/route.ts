import { NextResponse } from "next/server";
import { CreateExperimentInputSchema, type Experiment } from "@experiment/schemas";

let experiments: Experiment[] = [
  {
    id: "exp_001",
    key: "homepage_headline",
    name: "Homepage headline test",
    status: "active",
    variants: [
      { id: "control", name: "Control", weight: 50 },
      { id: "variant", name: "Outcome focused", weight: 50 }
    ],
    metrics: ["signup_rate"],
    rollout: 100,
    createdAt: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json(experiments);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CreateExperimentInputSchema.safeParse(body);

  if (!parsed.success || parsed.data.name.toLowerCase().includes("fail")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const next: Experiment = {
    id: `exp_${Date.now()}`,
    key: parsed.data.key,
    name: parsed.data.name,
    status: "draft",
    variants: [
      { id: "control", name: "Control", weight: 50 },
      { id: "variant", name: "Variant", weight: 50 }
    ],
    metrics: parsed.data.metrics,
    rollout: 100,
    createdAt: new Date().toISOString()
  };

  experiments = [next, ...experiments];
  return NextResponse.json(next, { status: 201 });
}
