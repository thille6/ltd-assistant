import type { Candidate } from '../candidate/types'
import type { LiveStats } from '../live/types'
import type { Trade } from './types'
import { APP_VERSION, SCHEMA_VERSION, type ModelSettings } from '../settings/types'
import { calculateLayStake, calculateMaxLiability, calculateNetResult } from '../../engine/trading/calculations'
import { toIsoNow } from '../../utils/dates'

export function createTradeFromSnapshot(candidate: Candidate, stats: LiveStats, settings: ModelSettings): Trade {
  const now = toIsoNow()
  const liability = calculateMaxLiability(settings.defaultBankroll, settings.defaultRiskPercent)
  const layStake = calculateLayStake(settings.defaultBankroll, settings.defaultRiskPercent, stats.layOdds ?? 2)

  return {
    id: crypto.randomUUID(),
    candidateId: candidate.id,
    matchLabel: `${candidate.match.homeTeam} vs ${candidate.match.awayTeam}`,
    modelVersion: candidate.evaluation.modelVersion,
    ltdScore: candidate.evaluation.ltdScore,
    entryMinute: stats.minute,
    entryScoreline: `${stats.homeGoals}-${stats.awayGoals}`,
    layOdds: stats.layOdds ?? 2,
    layStake,
    liability,
    exitMinute: null,
    backOdds: null,
    hedgeStake: null,
    commissionPercent: settings.commissionPercent,
    netResult: null,
    note: '',
    status: 'open',
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
  }
}

export function updateTradeExit(
  trade: Trade,
  backOdds: number,
  hedgeStake: number,
  exitMinute: number,
  commissionPercent: number,
): Trade {
  const netResult = calculateNetResult(trade.layStake, trade.liability, hedgeStake, backOdds, commissionPercent)

  return {
    ...trade,
    backOdds,
    hedgeStake,
    exitMinute,
    commissionPercent,
    netResult,
    status: netResult === null ? 'closed' : netResult > 0 ? 'won' : netResult < 0 ? 'lost' : 'void',
    updatedAt: toIsoNow(),
  }
}
