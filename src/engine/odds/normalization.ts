import type { OneXTwoProbabilities, OverUnderProbabilities, PrematchOdds } from '../../domain/match/types'

function normalizePair(firstOdds: number, secondOdds: number): { first: number; second: number; overround: number } {
  const firstRaw = 1 / firstOdds
  const secondRaw = 1 / secondOdds
  const total = firstRaw + secondRaw

  return {
    first: firstRaw / total,
    second: secondRaw / total,
    overround: total - 1,
  }
}

export function normalizeOneXTwo(odds: Pick<PrematchOdds, 'home' | 'draw' | 'away'>): OneXTwoProbabilities {
  const homeRaw = 1 / odds.home
  const drawRaw = 1 / odds.draw
  const awayRaw = 1 / odds.away
  const total = homeRaw + drawRaw + awayRaw

  return {
    home: homeRaw / total,
    draw: drawRaw / total,
    away: awayRaw / total,
    overround: total - 1,
  }
}

export function normalizeOverUnder(odds: Pick<PrematchOdds, 'over25' | 'under25'>): OverUnderProbabilities {
  const normalized = normalizePair(odds.over25, odds.under25)

  return {
    over25: normalized.first,
    under25: normalized.second,
    overround: normalized.overround,
  }
}
