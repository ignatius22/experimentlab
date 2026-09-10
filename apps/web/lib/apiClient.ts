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

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || "Failed to create experiment");
  }

  return ExperimentSchema.parse(json);
}
