import {
  CreateExperimentInputSchema,
  ExperimentListSchema,
  ExperimentSchema,
  type CreateExperimentInput,
  type Experiment
} from "@experiment/schemas";

let memoryExperiments: Experiment[] = [
  {
    id: "exp_001",
    key: "homepage_headline",
    name: "Homepage headline test",
    status: "active",
    variants: [
      { id: "control", name: "Control", weight: 50 },
      { id: "variant", name: "Outcome focused", weight: 50 }
    ],
    metrics: ["signup_rate", "cta_click_rate"],
    rollout: 100,
    createdAt: new Date().toISOString()
  }
];

export function listExperiments() {
  return memoryExperiments;
}

export async function fetchExperiments() {
  const response = await fetch("/api/experiments");
  const json = await response.json();
  return ExperimentListSchema.parse(json);
}

export async function createExperiment(input: CreateExperimentInput) {
  const payload = CreateExperimentInputSchema.parse(input);

  const response = await fetch("/api/experiments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Create failed");
  }

  const created = ExperimentSchema.parse(await response.json());
  memoryExperiments = [created, ...memoryExperiments];
  return created;
}
