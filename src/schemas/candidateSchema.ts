import { z } from 'zod'

export const classificationSchema = z.enum(['strong', 'possible', 'watch', 'reject'])

export const matchDetailsSchema = z.object({
  homeTeam: z.string().trim().min(1),
  awayTeam: z.string().trim().min(1),
  league: z.string().trim().optional(),
  kickoffAt: z.string().datetime().optional(),
})

export const prematchOddsSchema = z.object({
  home: z.number().gt(1),
  draw: z.number().gt(1),
  away: z.number().gt(1),
  over25: z.number().gt(1),
  under25: z.number().gt(1),
})

const oneXTwoSchema = z.object({
  home: z.number().min(0).max(1),
  draw: z.number().min(0).max(1),
  away: z.number().min(0).max(1),
  overround: z.number(),
})

const overUnderSchema = z.object({
  over25: z.number().min(0).max(1),
  under25: z.number().min(0).max(1),
  overround: z.number(),
})

export const prematchEvaluationSchema = z.object({
  oneXTwo: oneXTwoSchema,
  overUnder: overUnderSchema,
  favoriteProbability: z.number().min(0).max(1),
  ltdScore: z.number().min(0).max(100),
  classification: classificationSchema,
  passedRules: z.array(z.string()),
  failedRules: z.array(z.string()),
  warnings: z.array(z.string()),
  summary: z.string().min(1),
  modelVersion: z.string().min(1),
  evaluatedAt: z.string().datetime(),
})

export const candidateSchema = z.object({
  id: z.string().uuid(),
  match: matchDetailsSchema,
  odds: prematchOddsSchema,
  evaluation: prematchEvaluationSchema,
  status: z.enum(['active', 'archived']),
  latestLiveDecision: z.enum(['play', 'wait', 'skip']).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
  appVersion: z.string().min(1),
})

export type CandidateSchema = z.infer<typeof candidateSchema>
