import { z } from "zod";

export const RuleSchema = z.object({
  attribute: z.string(),
  operator: z.enum(["eq", "neq", "contains", "in", "nin", "gt", "gte", "lt", "lte"]),
  value: z.any()
});

export const IngestEventSchema = z.object({
  type: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  userId: z.string().min(1).max(128).optional().default("anonymous"),
  variantId: z.string().max(128).optional().nullable(),
  payload: z.record(z.any()).optional().default({}),
  timestamp: z.string().optional()
});

export const IngestEventBatchSchema = z.array(IngestEventSchema).min(1).max(1000);

export const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().int().min(0).max(100)
});

export const KeySchema = z.string().regex(/^[a-z0-9_]+$/i, "Keys must only contain alphanumeric characters and underscores");

export const ExperimentSchema = z.object({
  id: z.string(),
  key: KeySchema,
  name: z.string(),
  status: z.enum(["draft", "running", "active", "paused", "completed"]),
  variants: z.array(VariantSchema).min(1),
  metrics: z.array(z.string()),
  rollout: z.number().int().min(0).max(100),
  rules: z.array(RuleSchema).default([]),
  winningVariantId: z.string().optional().nullable(),
  createdAt: z.string()
});

export const FeatureFlagSchema = z.object({
  key: KeySchema,
  description: z.string(),
  enabled: z.boolean(),
  rollout: z.number().int().min(0).max(100).default(100),
  rules: z.array(RuleSchema).default([])
});

export const CreateExperimentInputSchema = z.object({
  name: z.string().min(2),
  key: KeySchema,
  metrics: z.array(z.string()).default(["signup_rate"]),
  rules: z.array(RuleSchema).optional()
});

export const CreateFeatureFlagInputSchema = z.object({
  key: KeySchema,
  description: z.string().optional()
});

export const ExperimentListSchema = z.array(ExperimentSchema);
export const FeatureFlagListSchema = z.array(FeatureFlagSchema);

export type Rule = z.infer<typeof RuleSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type CreateExperimentInput = z.infer<typeof CreateExperimentInputSchema>;
export type IngestEvent = z.infer<typeof IngestEventSchema>;
