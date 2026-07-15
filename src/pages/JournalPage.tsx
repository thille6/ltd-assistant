import { useMemo, useState } from 'react'

import { useAppContext } from '../app/AppContext'
import { TradeEditor } from '../components/forms/TradeEditor'
import { EmptyState } from '../components/feedback/EmptyState'
import { calculateJournalSummary } from '../engine/trading/calculations'
import { exportTradesToCsv } from '../services/csvExportService'
import { formatDate } from '../utils/dates'
import { downloadTextFile } from '../utils/downloads'

export function JournalPage() {
  const { trades, deleteTrade, saveTrade } = useAppContext()
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'open' | 'closed' | 'won' | 'lost' | 'void'>('all')

  const visibleTrades = useMemo(() => {
    return trades
      .filter((trade) => (statusFilter === 'all' ? true : trade.status === statusFilter))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [statusFilter, trades])

  const summary = useMemo(() => calculateJournalSummary(trades), [trades])

  if (trades.length === 0) {
    return <EmptyState title="Ingen journal ännu" description="Spara en trade från liveassistenten för att börja följa resultat." />
  }

  return (
    <section className="stacked">
      <div className="panel toolbar">
        <label>
          Filtrera status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="all">Alla</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
            <option value="void">Void</option>
          </select>
        </label>
      </div>

      <section className="panel">
        <h2>Sammanfattning</h2>
        <div className="button-row">
          <button
            type="button"
            onClick={() =>
              downloadTextFile('ltd-journal.csv', exportTradesToCsv(visibleTrades), 'text/csv;charset=utf-8')
            }
          >
            Exportera CSV
          </button>
        </div>
        <div className="summary-grid">
          <span>Antal trades: {summary.totalTrades}</span>
          <span>Öppna: {summary.openTrades}</span>
          <span>Avslutade: {summary.closedTrades}</span>
          <span>Vunna: {summary.wonTrades}</span>
          <span>Förlorade: {summary.lostTrades}</span>
          <span>Strike rate: {(summary.strikeRate * 100).toFixed(1)} %</span>
          <span>Total liability: {summary.totalLiability.toFixed(2)}</span>
          <span>Total nettovinst: {summary.totalNetProfit.toFixed(2)}</span>
          <span>ROI: {(summary.roiByLiability * 100).toFixed(1)} %</span>
          <span>Snittvinst: {summary.averageWin.toFixed(2)}</span>
          <span>Snittförlust: {summary.averageLoss.toFixed(2)}</span>
          <span>Största vinst: {summary.biggestWin.toFixed(2)}</span>
          <span>Största förlust: {summary.biggestLoss.toFixed(2)}</span>
        </div>
      </section>

      {visibleTrades.map((trade) => (
        <article className="panel" key={trade.id}>
          <div className="candidate-header">
            <div>
              <h3>{trade.matchLabel}</h3>
              <p>
                {formatDate(trade.createdAt)} | Status: {trade.status} | Entryminut: {trade.entryMinute} | Score:{' '}
                {trade.ltdScore}
              </p>
            </div>
            <div className="button-row">
              <button
                type="button"
                onClick={() =>
                  void saveTrade({
                    ...trade,
                    id: crypto.randomUUID(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: 'draft',
                  })
                }
              >
                Duplicera
              </button>
              <button type="button" className="danger-button" onClick={() => void deleteTrade(trade.id)}>
                Radera
              </button>
            </div>
          </div>

          <div className="inline-stats">
            <span>Layodds {trade.layOdds}</span>
            <span>Layinsats {trade.layStake.toFixed(2)}</span>
            <span>Liability {trade.liability.toFixed(2)}</span>
            <span>Netto {trade.netResult?.toFixed(2) ?? 'Öppen'}</span>
          </div>

          <TradeEditor onSave={saveTrade} trade={trade} />
        </article>
      ))}
    </section>
  )
}
