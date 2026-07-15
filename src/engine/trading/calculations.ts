import type { JournalSummary } from '../../domain/trade/types'
import { roundTo } from '../../utils/numbers'

export function calculateMaxLiability(bankroll: number, riskPercent: number): number {
  if (bankroll <= 0) {
    throw new Error('Bankrullen måste vara större än 0.')
  }

  if (riskPercent <= 0 || riskPercent > 100) {
    throw new Error('Riskprocenten måste vara större än 0 och högst 100.')
  }

  return bankroll * (riskPercent / 100)
}

export function calculateLayStake(bankroll: number, riskPercent: number, layOdds: number): number {
  if (layOdds <= 1) {
    throw new Error('Layodds måste vara större än 1.')
  }

  return calculateMaxLiability(bankroll, riskPercent) / (layOdds - 1)
}

export function calculateHedge(
  originalLayOdds: number,
  originalLayStake: number,
  currentBackOdds: number,
  commissionPercent: number,
): {
  recommendedBackStake: number
  resultIfDraw: number
  resultIfNotDraw: number
  greenUpResult: number
  resultAfterCommission: number
} {
  if (originalLayOdds <= 1 || currentBackOdds <= 1) {
    throw new Error('Odds måste vara större än 1.')
  }

  if (originalLayStake <= 0) {
    throw new Error('Layinsatsen måste vara större än 0.')
  }

  if (commissionPercent < 0 || commissionPercent > 100) {
    throw new Error('Kommission måste vara mellan 0 och 100.')
  }

  const recommendedBackStake = (originalLayOdds * originalLayStake) / currentBackOdds
  const resultIfDraw = originalLayStake - recommendedBackStake * (currentBackOdds - 1)
  const resultIfNotDraw = originalLayStake - recommendedBackStake
  const greenUpResult = (resultIfDraw + resultIfNotDraw) / 2
  const resultAfterCommission = greenUpResult - Math.max(greenUpResult, 0) * (commissionPercent / 100)

  return {
    recommendedBackStake,
    resultIfDraw,
    resultIfNotDraw,
    greenUpResult,
    resultAfterCommission,
  }
}

export function calculateNetResult(
  layStake: number,
  liability: number,
  backStake: number | null,
  backOdds: number | null,
  commissionPercent: number,
): number | null {
  if (backStake === null || backOdds === null) {
    return null
  }

  const profitIfNotDraw = layStake - backStake
  const profitIfDraw = backStake * (backOdds - 1) - liability
  const greenUp = (profitIfDraw + profitIfNotDraw) / 2

  return greenUp - Math.max(greenUp, 0) * (commissionPercent / 100)
}

export function calculateJournalSummary(
  trades: Array<{ status: string; liability: number; netResult: number | null }>,
): JournalSummary {
  const closedTrades = trades.filter((trade) => ['closed', 'won', 'lost', 'void'].includes(trade.status))
  const winningTrades = closedTrades.filter((trade) => (trade.netResult ?? 0) > 0)
  const losingTrades = closedTrades.filter((trade) => (trade.netResult ?? 0) < 0)
  const totalLiability = trades.reduce((sum, trade) => sum + trade.liability, 0)
  const totalNetProfit = closedTrades.reduce((sum, trade) => sum + (trade.netResult ?? 0), 0)

  return {
    totalTrades: trades.length,
    openTrades: trades.filter((trade) => ['draft', 'open'].includes(trade.status)).length,
    closedTrades: closedTrades.length,
    wonTrades: trades.filter((trade) => trade.status === 'won').length,
    lostTrades: trades.filter((trade) => trade.status === 'lost').length,
    strikeRate: closedTrades.length === 0 ? 0 : winningTrades.length / closedTrades.length,
    totalLiability,
    totalNetProfit,
    roiByLiability: totalLiability === 0 ? 0 : totalNetProfit / totalLiability,
    averageWin:
      winningTrades.length === 0
        ? 0
        : roundTo(winningTrades.reduce((sum, trade) => sum + (trade.netResult ?? 0), 0) / winningTrades.length, 2),
    averageLoss:
      losingTrades.length === 0
        ? 0
        : roundTo(losingTrades.reduce((sum, trade) => sum + (trade.netResult ?? 0), 0) / losingTrades.length, 2),
    biggestWin: winningTrades.length === 0 ? 0 : Math.max(...winningTrades.map((trade) => trade.netResult ?? 0)),
    biggestLoss: losingTrades.length === 0 ? 0 : Math.min(...losingTrades.map((trade) => trade.netResult ?? 0)),
  }
}
