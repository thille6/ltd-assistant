import type { Candidate } from '../domain/candidate/types'
import type { LiveSnapshot } from '../domain/live/types'
import { APP_VERSION, SCHEMA_VERSION, type ModelSettings } from '../domain/settings/types'
import type { Trade } from '../domain/trade/types'
import { exportBundleSchema } from '../schemas/exportBundleSchema'
import { toIsoNow } from '../utils/dates'

export interface ExportBundle {
  schemaVersion: number
  appVersion: string
  exportedAt: string
  candidates: Candidate[]
  liveSnapshots: LiveSnapshot[]
  trades: Trade[]
  settings: ModelSettings
}

export function createExportBundle(
  candidates: Candidate[],
  liveSnapshots: LiveSnapshot[],
  trades: Trade[],
  settings: ModelSettings,
): ExportBundle {
  return exportBundleSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: toIsoNow(),
    candidates,
    liveSnapshots,
    trades,
    settings,
  })
}

export function serializeExportBundle(bundle: ExportBundle): string {
  return JSON.stringify(exportBundleSchema.parse(bundle), null, 2)
}

export function parseExportBundle(value: string): ExportBundle {
  return exportBundleSchema.parse(JSON.parse(value) as unknown)
}
