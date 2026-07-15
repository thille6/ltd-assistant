import { z } from 'zod'

export const settingsSchema = z.object({
  maxDrawProbability: z.number().min(0).max(1),
  minOver25Probability: z.number().min(0).max(1),
  minFavoriteProbability: z.number().min(0).max(1),
  maxFavoriteProbability: z.number().min(0).max(1),
  minCandidateScore: z.number().min(0).max(100),
  minPlayScore: z.number().min(0).max(100),
  earliestEntryMinute: z.number().int().min(0).max(130),
  latestEntryMinute: z.number().int().min(0).max(130),
  minShotsTotal: z.number().int().min(0),
  minShotsOnTargetTotal: z.number().int().min(0),
  minLiveXg: z.number().min(0),
  defaultBankroll: z.number().positive(),
  defaultRiskPercent: z.number().gt(0).max(100),
  commissionPercent: z.number().min(0).max(100),
  theme: z.literal('dark'),
  lastOpenedCandidateId: z.string().uuid().nullable(),
  keyboardShortcutsEnabled: z.boolean(),
  modelVersion: z.string().min(1),
  schemaVersion: z.number().int().positive(),
})

export type SettingsSchema = z.infer<typeof settingsSchema>
