import { z } from 'zod'

import { candidateSchema } from './candidateSchema'
import { liveSnapshotSchema } from './liveSnapshotSchema'
import { settingsSchema } from './settingsSchema'
import { tradeSchema } from './tradeSchema'

export const exportBundleSchema = z.object({
  schemaVersion: z.number().int().positive(),
  appVersion: z.string().min(1),
  exportedAt: z.string().datetime(),
  candidates: z.array(candidateSchema),
  liveSnapshots: z.array(liveSnapshotSchema),
  trades: z.array(tradeSchema),
  settings: settingsSchema,
})

export type ExportBundleSchema = z.infer<typeof exportBundleSchema>
