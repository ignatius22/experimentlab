import { http, HttpResponse } from "msw";
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
    rules: [],
    createdAt: new Date().toISOString()
  }
];

export const handlers = [
  http.get("/api/experiments", () => HttpResponse.json(experiments)),
  http.post("/api/experiments", async ({ request }) => {
    const body = await request.json();
    const parsed = CreateExperimentInputSchema.safeParse(body);
    if (!parsed.success || parsed.data.name.toLowerCase().includes("fail")) {
      return new HttpResponse("invalid", { status: 400 });
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
      rules: [],
      createdAt: new Date().toISOString()
    };

    experiments = [next, ...experiments];
    return HttpResponse.json(next, { status: 201 });
  })
];
