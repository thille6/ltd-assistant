export type TradeStatus = 'draft' | 'open' | 'closed' | 'won' | 'lost' | 'void'

export interface HedgeCalculation {
  recommendedBackStake: number
  resultIfDraw: number
  resultIfNotDraw: number
  greenUpResult: number
  resultAfterCommission: number
}

export interface Trade {
  id: string
  candidateId: string
  matchLabel: string
  modelVersion: string
  ltdScore: number
  entryMinute: number
  entryScoreline: string
  layOdds: number
  layStake: number
  liability: number
  exitMinute: number | null
  backOdds: number | null
  hedgeStake: number | null
  commissionPercent: number
  netResult: number | null
  note: string
  status: TradeStatus
  createdAt: string
  updatedAt: string
  schemaVersion: number
  appVersion: string
}

export interface JournalSummary {
  totalTrades: number
  openTrades: number
  closedTrades: number
  wonTrades: number
  lostTrades: number
  strikeRate: number
  totalLiability: number
  totalNetProfit: number
  roiByLiability: number
  averageWin: number
  averageLoss: number
  biggestWin: number
  biggestLoss: number
}
