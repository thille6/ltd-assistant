import { z } from 'zod'

export const liveStatsSchema = z.object({
  minute: z.number().int().min(0).max(130),
  homeGoals: z.number().int().min(0),
  awayGoals: z.number().int().min(0),
  homeShots: z.number().int().min(0),
  awayShots: z.number().int().min(0),
  homeShotsOnTarget: z.number().int().min(0),
  awayShotsOnTarget: z.number().int().min(0),
  homeRedCards: z.number().int().min(0),
  awayRedCards: z.number().int().min(0),
  liveXg: z.number().min(0).nullable(),
  layOdds: z.number().gt(1).nullable(),
})

export const liveDecisionSchema = z.object({
  status: z.enum(['play', 'wait', 'skip']),
  mainReason: z.string().min(1),
  supportingReasons: z.array(z.string()),
  warnings: z.array(z.string()),
  blockingRule: z.string().nullable(),
  recommendedLayStake: z.number().min(0).nullable(),
  liability: z.number().min(0).nullable(),
  evaluatedAt: z.string().datetime(),
})

export const liveEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  minute: z.number().int().min(0).max(130),
  type: z.enum([
    'home-shot',
    'away-shot',
    'home-shot-on-target',
    'away-shot-on-target',
    'home-goal',
    'away-goal',
    'home-red-card',
    'away-red-card',
    'minute-adjust',
    'snapshot-saved',
  ]),
  team: z.enum(['home', 'away', 'none']),
  previousValue: z.number(),
  nextValue: z.number(),
})

export const liveSnapshotSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  stats: liveStatsSchema,
  decision: liveDecisionSchema,
  events: z.array(liveEventSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
  appVersion: z.string().min(1),
})
