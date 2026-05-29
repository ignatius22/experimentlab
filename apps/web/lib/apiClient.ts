import {
  CreateExperimentInputSchema,
  ExperimentListSchema,
  ExperimentSchema,
  type CreateExperimentInput
} from "@experiment/schemas";

export async function fetchExperiments() {
  const response = await fetch("/api/experiments");
  if (!response.ok) return [];
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

  return ExperimentSchema.parse(await response.json());
}
