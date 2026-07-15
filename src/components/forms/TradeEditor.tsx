import { useMemo, useState } from 'react'

import type { Trade } from '../../domain/trade/types'
import { calculateHedge, calculateNetResult } from '../../engine/trading/calculations'
import { safeNumber } from '../../utils/numbers'

interface TradeEditorProps {
  trade: Trade
  onSave(trade: Trade): Promise<void>
}

export function TradeEditor({ trade, onSave }: TradeEditorProps) {
  const [backOdds, setBackOdds] = useState(trade.backOdds?.toString() ?? '')
  const [hedgeStake, setHedgeStake] = useState(trade.hedgeStake?.toString() ?? '')
  const [exitMinute, setExitMinute] = useState(trade.exitMinute?.toString() ?? '')
  const [note, setNote] = useState(trade.note)

  const preview = useMemo(() => {
    const parsedBackOdds = safeNumber(backOdds)
    const parsedStake = safeNumber(hedgeStake)

    if (!parsedBackOdds || !parsedStake) {
      return null
    }

    const hedge = calculateHedge(trade.layOdds, trade.layStake, parsedBackOdds, trade.commissionPercent)
    const netResult = calculateNetResult(trade.layStake, trade.liability, parsedStake, parsedBackOdds, trade.commissionPercent)

    return {
      ...hedge,
      netResult,
    }
  }, [backOdds, hedgeStake, trade])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedBackOdds = safeNumber(backOdds)
    const parsedStake = safeNumber(hedgeStake)
    const parsedMinute = safeNumber(exitMinute)

    const nextTrade: Trade = {
      ...trade,
      backOdds: parsedBackOdds,
      hedgeStake: parsedStake,
      exitMinute: parsedMinute === null ? null : Math.round(parsedMinute),
      netResult:
        parsedBackOdds && parsedStake
          ? calculateNetResult(trade.layStake, trade.liability, parsedStake, parsedBackOdds, trade.commissionPercent)
          : trade.netResult,
      status: parsedBackOdds && parsedStake ? 'closed' : trade.status,
      note,
    }

    await onSave(nextTrade)
  }

  return (
    <form className="stacked compact-form" onSubmit={handleSubmit}>
      <div className="grid four">
        <label>
          Backodds
          <input value={backOdds} onChange={(event) => setBackOdds(event.target.value)} />
        </label>
        <label>
          Hedgeinsats
          <input value={hedgeStake} onChange={(event) => setHedgeStake(event.target.value)} />
        </label>
        <label>
          Exitminut
          <input value={exitMinute} onChange={(event) => setExitMinute(event.target.value)} />
        </label>
        <label>
          Anteckning
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>

      {preview ? (
        <div className="inline-stats">
          <span>Rekommenderad backinsats: {preview.recommendedBackStake.toFixed(2)}</span>
          <span>Green-up: {preview.greenUpResult.toFixed(2)}</span>
          <span>Efter kommission: {preview.resultAfterCommission.toFixed(2)}</span>
          <span>Nettoutfall: {(preview.netResult ?? 0).toFixed(2)}</span>
        </div>
      ) : null}

      <button type="submit">Spara trade</button>
    </form>
  )
}
