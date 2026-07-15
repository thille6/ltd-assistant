import type { Trade } from '../domain/trade/types'

const CSV_HEADERS = [
  'datum',
  'match',
  'modellversion',
  'ltd-score',
  'entryminut',
  'entrystallning',
  'layodds',
  'layinsats',
  'liability',
  'exitminut',
  'backodds',
  'hedgeinsats',
  'kommission',
  'nettoresultat',
  'status',
  'anteckning',
]

function escapeCsvValue(value: string | number | null): string {
  const normalized = value === null ? '' : String(value)
  return `"${normalized.replaceAll('"', '""')}"`
}

export function exportTradesToCsv(trades: Trade[]): string {
  const rows = trades.map((trade) => [
    trade.createdAt,
    trade.matchLabel,
    trade.modelVersion,
    trade.ltdScore,
    trade.entryMinute,
    trade.entryScoreline,
    trade.layOdds,
    trade.layStake,
    trade.liability,
    trade.exitMinute,
    trade.backOdds,
    trade.hedgeStake,
    trade.commissionPercent,
    trade.netResult,
    trade.status,
    trade.note,
  ])

  return [CSV_HEADERS, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(','))
    .join('\n')
}
