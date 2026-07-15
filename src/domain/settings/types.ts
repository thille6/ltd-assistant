export interface ModelSettings {
  maxDrawProbability: number
  minOver25Probability: number
  minFavoriteProbability: number
  maxFavoriteProbability: number
  minCandidateScore: number
  minPlayScore: number
  earliestEntryMinute: number
  latestEntryMinute: number
  minShotsTotal: number
  minShotsOnTargetTotal: number
  minLiveXg: number
  defaultBankroll: number
  defaultRiskPercent: number
  commissionPercent: number
  theme: 'dark'
  lastOpenedCandidateId: string | null
  keyboardShortcutsEnabled: boolean
  modelVersion: string
  schemaVersion: number
}

export interface SettingsExport {
  settings: ModelSettings
  exportedAt: string
}

export const APP_VERSION = '1.0.0'
export const MODEL_VERSION = '1.0.0'
export const SCHEMA_VERSION = 1

export const defaultModelSettings: ModelSettings = {
  maxDrawProbability: 0.25,
  minOver25Probability: 0.56,
  minFavoriteProbability: 0.58,
  maxFavoriteProbability: 0.8,
  minCandidateScore: 70,
  minPlayScore: 70,
  earliestEntryMinute: 15,
  latestEntryMinute: 35,
  minShotsTotal: 6,
  minShotsOnTargetTotal: 2,
  minLiveXg: 0.5,
  defaultBankroll: 1000,
  defaultRiskPercent: 2,
  commissionPercent: 5,
  theme: 'dark',
  lastOpenedCandidateId: null,
  keyboardShortcutsEnabled: true,
  modelVersion: MODEL_VERSION,
  schemaVersion: SCHEMA_VERSION,
}
