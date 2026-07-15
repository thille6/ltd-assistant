import type { Candidate } from '../../domain/candidate/types'
import type { LiveDecision, LiveEvent, LiveEventType, LiveStats } from '../../domain/live/types'
import type { ModelSettings } from '../../domain/settings/types'
import { toIsoNow } from '../../utils/dates'
import { roundTo } from '../../utils/numbers'
import { calculateLayStake, calculateMaxLiability } from '../trading/calculations'

export function createInitialLiveStats(): LiveStats {
  return {
    minute: 0,
    homeGoals: 0,
    awayGoals: 0,
    homeShots: 0,
    awayShots: 0,
    homeShotsOnTarget: 0,
    awayShotsOnTarget: 0,
    homeRedCards: 0,
    awayRedCards: 0,
    liveXg: null,
    layOdds: null,
  }
}

export function evaluateLiveDecision(candidate: Candidate, stats: LiveStats, settings: ModelSettings): LiveDecision {
  const isDraw = stats.homeGoals === stats.awayGoals
  const noRedCards = stats.homeRedCards + stats.awayRedCards === 0
  const totalShots = stats.homeShots + stats.awayShots
  const totalShotsOnTarget = stats.homeShotsOnTarget + stats.awayShotsOnTarget
  const layOddsValid = typeof stats.layOdds === 'number' && stats.layOdds > 1
  const activityReached =
    totalShots >= settings.minShotsTotal &&
    (totalShotsOnTarget >= settings.minShotsOnTargetTotal || (stats.liveXg ?? 0) >= settings.minLiveXg)

  const supportingReasons = [
    `Prematch-score: ${candidate.evaluation.ltdScore}`,
    `Ställning: ${stats.homeGoals}-${stats.awayGoals}`,
    `Minut: ${stats.minute}`,
    `Skott totalt: ${totalShots}`,
    `Skott på mål totalt: ${totalShotsOnTarget}`,
  ]

  const warnings: string[] = []
  let status: LiveDecision['status'] = 'wait'
  let mainReason = 'Matchen uppfyller grundkraven men aktivitetskravet är ännu inte uppfyllt.'
  let blockingRule: string | null = 'Aktivitetskrav ännu inte uppfyllt'

  if (!layOddsValid) {
    status = 'skip'
    mainReason = 'Nödvändiga livevärden är ogiltiga eftersom layodds saknas eller är för lågt.'
    blockingRule = 'Ogiltigt layodds'
  } else if (candidate.evaluation.ltdScore < settings.minPlayScore) {
    status = 'skip'
    mainReason = 'Prematch-score är under minsta PLAY-score.'
    blockingRule = 'Prematch-score under gräns'
  } else if (!isDraw) {
    status = 'skip'
    mainReason = 'Matchen är inte längre oavgjord före entry.'
    blockingRule = 'Matchen är inte oavgjord'
  } else if (!noRedCards) {
    status = 'skip'
    mainReason = 'Rött kort har inträffat och blockerar entry.'
    blockingRule = 'Rött kort'
  } else if (stats.minute > settings.latestEntryMinute) {
    status = 'skip'
    mainReason = 'Senaste tillåtna entryminut har passerats.'
    blockingRule = 'För sen entryminut'
  } else if (stats.minute < settings.earliestEntryMinute) {
    status = 'wait'
    mainReason = 'Matchen är fortfarande för tidig för entry.'
    blockingRule = 'För tidig entryminut'
  } else if (activityReached) {
    status = 'play'
    mainReason = 'Matchen uppfyller prematchkraven och visar tillräcklig aktivitet för PLAY.'
    blockingRule = null
  }

  if ((stats.liveXg ?? 0) >= settings.minLiveXg) {
    supportingReasons.push(`Live-xG ${roundTo(stats.liveXg ?? 0, 2)} når aktivitetströskeln.`)
  }

  if (status !== 'play' && stats.minute >= settings.latestEntryMinute - 3) {
    warnings.push('Entryfönstret håller på att stängas.')
  }

  const liability = layOddsValid
    ? calculateMaxLiability(settings.defaultBankroll, settings.defaultRiskPercent)
    : null
  const recommendedLayStake = layOddsValid
    ? calculateLayStake(settings.defaultBankroll, settings.defaultRiskPercent, stats.layOdds ?? 0)
    : null

  return {
    status,
    mainReason,
    supportingReasons,
    warnings,
    blockingRule,
    recommendedLayStake,
    liability,
    evaluatedAt: toIsoNow(),
  }
}

function applyIncrement(stats: LiveStats, key: keyof LiveStats, nextValue: number): LiveStats {
  return {
    ...stats,
    [key]: nextValue,
  }
}

export function applyLiveEvent(stats: LiveStats, type: LiveEventType, amount = 1): LiveStats {
  switch (type) {
    case 'home-shot':
      return applyIncrement(stats, 'homeShots', stats.homeShots + amount)
    case 'away-shot':
      return applyIncrement(stats, 'awayShots', stats.awayShots + amount)
    case 'home-shot-on-target':
      return { ...stats, homeShotsOnTarget: stats.homeShotsOnTarget + amount, homeShots: stats.homeShots + amount }
    case 'away-shot-on-target':
      return { ...stats, awayShotsOnTarget: stats.awayShotsOnTarget + amount, awayShots: stats.awayShots + amount }
    case 'home-goal':
      return applyIncrement(stats, 'homeGoals', stats.homeGoals + amount)
    case 'away-goal':
      return applyIncrement(stats, 'awayGoals', stats.awayGoals + amount)
    case 'home-red-card':
      return applyIncrement(stats, 'homeRedCards', stats.homeRedCards + amount)
    case 'away-red-card':
      return applyIncrement(stats, 'awayRedCards', stats.awayRedCards + amount)
    case 'minute-adjust':
      return { ...stats, minute: Math.max(0, stats.minute + amount) }
    case 'snapshot-saved':
      return stats
    default:
      return stats
  }
}

export function undoLiveEvent(stats: LiveStats, event: LiveEvent): LiveStats {
  switch (event.type) {
    case 'home-shot':
      return { ...stats, homeShots: event.previousValue }
    case 'away-shot':
      return { ...stats, awayShots: event.previousValue }
    case 'home-shot-on-target':
      return { ...stats, homeShotsOnTarget: event.previousValue, homeShots: Math.max(0, stats.homeShots - 1) }
    case 'away-shot-on-target':
      return { ...stats, awayShotsOnTarget: event.previousValue, awayShots: Math.max(0, stats.awayShots - 1) }
    case 'home-goal':
      return { ...stats, homeGoals: event.previousValue }
    case 'away-goal':
      return { ...stats, awayGoals: event.previousValue }
    case 'home-red-card':
      return { ...stats, homeRedCards: event.previousValue }
    case 'away-red-card':
      return { ...stats, awayRedCards: event.previousValue }
    case 'minute-adjust':
      return { ...stats, minute: event.previousValue }
    case 'snapshot-saved':
      return stats
    default:
      return stats
  }
}
