import { describe, expect, it } from 'vitest'

import { createCandidate } from '../../domain/candidate/createCandidate'
import { createInitialLiveStats, evaluateLiveDecision, undoLiveEvent } from '../../engine/live/evaluateLiveDecision'
import { calculateLtdScore, classifyCandidate, evaluatePrematch } from '../../engine/ltd/evaluateCandidate'
import { normalizeOneXTwo, normalizeOverUnder } from '../../engine/odds/normalization'
import {
  calculateHedge,
  calculateJournalSummary,
  calculateLayStake,
  calculateMaxLiability,
} from '../../engine/trading/calculations'
import { parseExportBundle, serializeExportBundle } from '../../services/backupService'
import { defaultModelSettings } from '../../domain/settings/types'
import { exportBundleSchema } from '../../schemas/exportBundleSchema'
import { createStoredEnvelope } from '../../storage/storageEnvelope'
import { ensureSupportedSchema } from '../../storage/migrations'

describe('odds normalization', () => {
  it('normalizes 1X2 and returns overround', () => {
    const result = normalizeOneXTwo({ home: 2.1, draw: 3.4, away: 4.1 })
    expect(result.home + result.draw + result.away).toBeCloseTo(1, 8)
    expect(result.overround).toBeGreaterThan(0)
  })

  it('normalizes over under market', () => {
    const result = normalizeOverUnder({ over25: 1.8, under25: 2.1 })
    expect(result.over25 + result.under25).toBeCloseTo(1, 8)
  })
})

describe('prematch engine', () => {
  it('classifies exact boundary values correctly', () => {
    expect(classifyCandidate(60)).toBe('watch')
    expect(classifyCandidate(70)).toBe('possible')
    expect(classifyCandidate(80)).toBe('strong')
  })

  it('evaluates candidate explanations and score deterministically', () => {
    const evaluation = evaluatePrematch(
      { home: 1.9, draw: 3.9, away: 4.8, over25: 1.7, under25: 2.2 },
      defaultModelSettings,
    )

    expect(evaluation.ltdScore).toBeGreaterThanOrEqual(70)
    expect(evaluation.passedRules.length).toBeGreaterThan(0)
    expect(evaluation.summary.length).toBeGreaterThan(0)
  })

  it('honors the documented thresholds exactly', () => {
    const score = calculateLtdScore(0.25, 0.56, 0.58)
    expect(score).toBeGreaterThanOrEqual(25)
  })
})

describe('live engine', () => {
  it('returns play when all live rules are satisfied', () => {
    const candidate = createCandidate(
      { homeTeam: 'A', awayTeam: 'B' },
      { home: 1.9, draw: 3.8, away: 5, over25: 1.7, under25: 2.25 },
      evaluatePrematch({ home: 1.9, draw: 3.8, away: 5, over25: 1.7, under25: 2.25 }, defaultModelSettings),
    )

    const stats = {
      ...createInitialLiveStats(),
      minute: 15,
      homeShots: 4,
      awayShots: 2,
      homeShotsOnTarget: 1,
      awayShotsOnTarget: 1,
      liveXg: 0.5,
      layOdds: 2.4,
    }

    expect(evaluateLiveDecision(candidate, stats, defaultModelSettings).status).toBe('play')
  })

  it('undos the last live event correctly', () => {
    const stats = createInitialLiveStats()
    const undone = undoLiveEvent(
      { ...stats, homeShots: 2 },
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        minute: 12,
        type: 'home-shot',
        team: 'home',
        previousValue: 1,
        nextValue: 2,
      },
    )

    expect(undone.homeShots).toBe(1)
  })
})

describe('trading engine', () => {
  it('calculates liability and lay stake', () => {
    expect(calculateMaxLiability(1000, 2)).toBe(20)
    expect(calculateLayStake(1000, 2, 2)).toBe(20)
  })

  it('calculates hedge and commission', () => {
    const hedge = calculateHedge(3, 10, 2, 5)
    expect(hedge.recommendedBackStake).toBeCloseTo(15, 2)
    expect(hedge.resultAfterCommission).toBeTypeOf('number')
  })

  it('calculates journal summary', () => {
    const summary = calculateJournalSummary([
      { status: 'won', liability: 20, netResult: 5 },
      { status: 'lost', liability: 20, netResult: -7 },
    ])

    expect(summary.totalTrades).toBe(2)
    expect(summary.wonTrades).toBe(1)
    expect(summary.lostTrades).toBe(1)
  })
})

describe('validation and serialization', () => {
  it('serializes and parses export bundles', () => {
    const bundle = exportBundleSchema.parse({
      schemaVersion: 1,
      appVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      candidates: [],
      liveSnapshots: [],
      trades: [],
      settings: defaultModelSettings,
    })

    const parsed = parseExportBundle(serializeExportBundle(bundle))
    expect(parsed.settings.schemaVersion).toBe(1)
  })

  it('keeps current schema and allows migration pass-through', () => {
    const envelope = createStoredEnvelope({ value: 1 })
    expect(ensureSupportedSchema(envelope).schemaVersion).toBe(1)
  })
})
