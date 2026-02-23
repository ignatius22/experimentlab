import { z } from "zod";

export const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().int().min(0).max(100)
});

export const ExperimentSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  status: z.enum(["draft", "active", "paused"]),
  variants: z.array(VariantSchema).min(1),
  metrics: z.array(z.string()),
  rollout: z.number().int().min(0).max(100),
  createdAt: z.string()
});

export const FeatureFlagSchema = z.object({
  key: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  rollout: z.number().int().min(0).max(100).default(100)
});

export const CreateExperimentInputSchema = z.object({
  name: z.string().min(2),
  key: z.string().min(2),
  metrics: z.array(z.string()).default(["signup_rate"])
});

export const ExperimentListSchema = z.array(ExperimentSchema);
export const FeatureFlagListSchema = z.array(FeatureFlagSchema);

export type Variant = z.infer<typeof VariantSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type CreateExperimentInput = z.infer<typeof CreateExperimentInputSchema>;
