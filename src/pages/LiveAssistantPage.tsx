import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAppContext } from '../app/AppContext'
import { EmptyState } from '../components/feedback/EmptyState'
import { LiveControlPad } from '../components/live/LiveControlPad'
import { LiveDecisionCard } from '../components/live/LiveDecisionCard'
import { createTradeFromSnapshot } from '../domain/trade/createTrade'
import type { LiveEvent, LiveEventType, LiveSnapshot, LiveStats } from '../domain/live/types'
import { APP_VERSION, SCHEMA_VERSION } from '../domain/settings/types'
import { applyLiveEvent, createInitialLiveStats, evaluateLiveDecision, undoLiveEvent } from '../engine/live/evaluateLiveDecision'
import { safeNumber } from '../utils/numbers'

function createEvent(type: LiveEventType, stats: LiveStats, amount: number): LiveEvent {
  const timestamp = new Date().toISOString()

  switch (type) {
    case 'home-shot':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'home', previousValue: stats.homeShots, nextValue: stats.homeShots + amount }
    case 'away-shot':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'away', previousValue: stats.awayShots, nextValue: stats.awayShots + amount }
    case 'home-shot-on-target':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'home', previousValue: stats.homeShotsOnTarget, nextValue: stats.homeShotsOnTarget + amount }
    case 'away-shot-on-target':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'away', previousValue: stats.awayShotsOnTarget, nextValue: stats.awayShotsOnTarget + amount }
    case 'home-goal':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'home', previousValue: stats.homeGoals, nextValue: stats.homeGoals + amount }
    case 'away-goal':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'away', previousValue: stats.awayGoals, nextValue: stats.awayGoals + amount }
    case 'home-red-card':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'home', previousValue: stats.homeRedCards, nextValue: stats.homeRedCards + amount }
    case 'away-red-card':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'away', previousValue: stats.awayRedCards, nextValue: stats.awayRedCards + amount }
    case 'minute-adjust':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'none', previousValue: stats.minute, nextValue: Math.max(0, stats.minute + amount) }
    case 'snapshot-saved':
      return { id: crypto.randomUUID(), timestamp, minute: stats.minute, type, team: 'none', previousValue: 0, nextValue: 0 }
  }
}

export function LiveAssistantPage() {
  const { id } = useParams()
  const { candidates, settings, getLiveSnapshots, saveLiveSnapshot, saveTrade, saveCandidate } = useAppContext()
  const candidate = candidates.find((item) => item.id === id)
  const [stats, setStats] = useState<LiveStats>(createInitialLiveStats())
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [savedSnapshots, setSavedSnapshots] = useState<LiveSnapshot[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!candidate) {
      return
    }

    void getLiveSnapshots(candidate.id).then((snapshots) => {
      setSavedSnapshots(snapshots)

      if (snapshots[0]) {
        setStats(snapshots[0].stats)
        setEvents(snapshots[0].events)
      }
    })
  }, [candidate, getLiveSnapshots])

  const decision = useMemo(() => {
    if (!candidate) {
      return null
    }

    return evaluateLiveDecision(candidate, stats, settings)
  }, [candidate, settings, stats])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!settings.keyboardShortcutsEnabled) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        handleUndo()
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'h') handleApply('home-shot')
      if (key === 'b') handleApply('away-shot')
      if (key === 'j') handleApply('home-shot-on-target')
      if (key === 'n') handleApply('away-shot-on-target')
      if (key === 'm' && !event.shiftKey) handleApply('home-goal')
      if (key === 'm' && event.shiftKey) handleApply('away-goal')
      if (key === 'r' && !event.shiftKey) handleApply('home-red-card')
      if (key === 'r' && event.shiftKey) handleApply('away-red-card')
      if (key === 's') {
        event.preventDefault()
        void handleSaveSnapshot()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  if (!candidate || !decision) {
    return <EmptyState title="Kandidaten hittades inte" description="Öppna liveassistenten från en sparad kandidat." />
  }

  const ensuredCandidate = candidate
  const ensuredDecision = decision

  function handleApply(type: LiveEventType, amount = 1) {
    const event = createEvent(type, stats, amount)
    setStats((current) => applyLiveEvent(current, type, amount))
    setEvents((current) => [event, ...current])
  }

  function handleUndo() {
    const [lastEvent, ...rest] = events
    if (!lastEvent) {
      return
    }

    setStats((current) => undoLiveEvent(current, lastEvent))
    setEvents(rest)
  }

  async function handleSaveSnapshot() {
    const snapshot: LiveSnapshot = {
      id: crypto.randomUUID(),
      candidateId: ensuredCandidate.id,
      stats,
      decision: ensuredDecision,
      events,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      appVersion: APP_VERSION,
    }

    await saveLiveSnapshot(snapshot)
    await saveCandidate({
      ...ensuredCandidate,
      latestLiveDecision: ensuredDecision.status,
      updatedAt: new Date().toISOString(),
    })
    setSavedSnapshots((current) => [snapshot, ...current])
    setMessage('Snapshot sparad.')
  }

  async function handleCreateTrade() {
    const trade = createTradeFromSnapshot(ensuredCandidate, stats, settings)
    await saveTrade(trade)
    setMessage('Trade skapad från nuvarande snapshot.')
  }

  return (
    <section className="stacked live-page">
      <header className="panel live-header">
        <div>
          <p className="eyebrow">Operatörsläge</p>
          <h2>
            {ensuredCandidate.match.homeTeam} vs {ensuredCandidate.match.awayTeam}
          </h2>
        </div>
        <div className="inline-stats">
          <span>Minut {stats.minute}</span>
          <span>Resultat {stats.homeGoals}-{stats.awayGoals}</span>
          <span>Prematch-score {ensuredCandidate.evaluation.ltdScore}</span>
          <span>Layodds {stats.layOdds ?? 'Ej satt'}</span>
        </div>
      </header>

      <div className="grid two">
        <section className="panel">
          <h3>Manuella värden</h3>
          <div className="grid two">
            <label>
              Aktuell minut
              <input
                value={stats.minute}
                onChange={(event) => setStats({ ...stats, minute: Math.max(0, Math.round(safeNumber(event.target.value) ?? 0)) })}
              />
            </label>
            <label>
              Layodds
              <input
                value={stats.layOdds ?? ''}
                onChange={(event) => setStats({ ...stats, layOdds: safeNumber(event.target.value) })}
              />
            </label>
            <label>
              Total live-xG
              <input
                value={stats.liveXg ?? ''}
                onChange={(event) => setStats({ ...stats, liveXg: safeNumber(event.target.value) })}
              />
            </label>
            <label>
              Hemmaskott
              <input
                value={stats.homeShots}
                onChange={(event) => setStats({ ...stats, homeShots: Math.max(0, Math.round(safeNumber(event.target.value) ?? 0)) })}
              />
            </label>
            <label>
              Bortaskott
              <input
                value={stats.awayShots}
                onChange={(event) => setStats({ ...stats, awayShots: Math.max(0, Math.round(safeNumber(event.target.value) ?? 0)) })}
              />
            </label>
            <label>
              Skott på mål totalt
              <input
                value={stats.homeShotsOnTarget + stats.awayShotsOnTarget}
                onChange={(event) => {
                  const total = Math.max(0, Math.round(safeNumber(event.target.value) ?? 0))
                  setStats({
                    ...stats,
                    homeShotsOnTarget: Math.ceil(total / 2),
                    awayShotsOnTarget: Math.floor(total / 2),
                  })
                }}
              />
            </label>
          </div>
        </section>

        <LiveDecisionCard decision={ensuredDecision} />
      </div>

      <LiveControlPad onApply={handleApply} onUndo={handleUndo} />

      <div className="button-row sticky-actions">
        <button type="button" className="primary-button" onClick={() => void handleSaveSnapshot()}>
          Spara snapshot
        </button>
        <button type="button" onClick={() => void handleCreateTrade()}>
          Spara trade
        </button>
      </div>

      {message ? <p className="status-message">{message}</p> : null}

      <section className="panel">
        <h3>Händelselogg</h3>
        <ul className="plain-list">
          {events.map((event) => (
            <li key={event.id}>
              {event.timestamp} | minut {event.minute} | {event.type} | {event.team} | {event.previousValue} → {event.nextValue}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h3>Sparade snapshots</h3>
        <ul className="plain-list">
          {savedSnapshots.map((snapshot) => (
            <li key={snapshot.id}>
              {snapshot.updatedAt} | {snapshot.decision.status.toUpperCase()} | {snapshot.decision.mainReason}
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
