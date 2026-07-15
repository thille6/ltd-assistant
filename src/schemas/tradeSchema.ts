import { z } from 'zod'

export const tradeSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  matchLabel: z.string().min(1),
  modelVersion: z.string().min(1),
  ltdScore: z.number().min(0).max(100),
  entryMinute: z.number().int().min(0).max(130),
  entryScoreline: z.string().min(1),
  layOdds: z.number().gt(1),
  layStake: z.number().gt(0),
  liability: z.number().gt(0),
  exitMinute: z.number().int().min(0).max(130).nullable(),
  backOdds: z.number().gt(1).nullable(),
  hedgeStake: z.number().min(0).nullable(),
  commissionPercent: z.number().min(0).max(100),
  netResult: z.number().nullable(),
  note: z.string(),
  status: z.enum(['draft', 'open', 'closed', 'won', 'lost', 'void']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  schemaVersion: z.number().int().positive(),
  appVersion: z.string().min(1),
})

export type TradeSchema = z.infer<typeof tradeSchema>
