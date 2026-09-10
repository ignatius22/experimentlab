import type { Experiment } from "@experiment/schemas";
import { bucket } from "./bucketing";
import { exposure } from "./analytics";

const KEY = "experiment_assignments";

type Assignment = Record<string, string>;

function readAssignments(): Assignment {
  if (typeof window === "undefined") {
    return {};
  }
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Assignment) : {};
}

function writeAssignments(assignments: Assignment) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(assignments));
  }
}

export function getAssignedVariant(userId: string, experiment: Experiment) {
  const assignments = readAssignments();
  if (assignments[experiment.key]) {
    const existing = experiment.variants.find((variant) => variant.id === assignments[experiment.key]);
    if (existing) {
      return existing;
    }
  }

  const value = bucket(userId, experiment.key);
  let cursor = 0;
  const selected = experiment.variants.find((variant) => {
    cursor += variant.weight;
    return value < cursor;
  }) ?? experiment.variants[0];

  assignments[experiment.key] = selected.id;
  writeAssignments(assignments);
  exposure(experiment.key, selected.id);
  return selected;
}
