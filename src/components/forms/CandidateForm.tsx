import { useMemo, useState } from 'react'

import { createCandidate } from '../../domain/candidate/createCandidate'
import type { Candidate } from '../../domain/candidate/types'
import type { MatchDetails, PrematchOdds } from '../../domain/match/types'
import type { ModelSettings } from '../../domain/settings/types'
import { evaluatePrematch } from '../../engine/ltd/evaluateCandidate'
import { safeNumber } from '../../utils/numbers'

interface CandidateFormProps {
  settings: ModelSettings
  onSave(candidate: Candidate): Promise<void>
}

type CandidateFormState = {
  homeTeam: string
  awayTeam: string
  league: string
  kickoffAt: string
  home: string
  draw: string
  away: string
  over25: string
  under25: string
}

const initialState: CandidateFormState = {
  homeTeam: '',
  awayTeam: '',
  league: '',
  kickoffAt: '',
  home: '',
  draw: '',
  away: '',
  over25: '',
  under25: '',
}

export function CandidateForm({ settings, onSave }: CandidateFormProps) {
  const [form, setForm] = useState<CandidateFormState>(initialState)
  const [message, setMessage] = useState<string | null>(null)

  const odds = useMemo<PrematchOdds | null>(() => {
    const values = {
      home: safeNumber(form.home),
      draw: safeNumber(form.draw),
      away: safeNumber(form.away),
      over25: safeNumber(form.over25),
      under25: safeNumber(form.under25),
    }

    const allValid = Object.values(values).every((value) => value !== null && value > 1)
    if (!allValid) {
      return null
    }

    return values as PrematchOdds
  }, [form])

  const evaluation = useMemo(() => {
    if (!odds) {
      return null
    }

    return evaluatePrematch(odds, settings)
  }, [odds, settings])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!odds || !evaluation) {
      setMessage('Fyll i giltiga odds större än 1 för att spara kandidaten.')
      return
    }

    const kickoffAt = form.kickoffAt
      ? (() => {
          const parsed = new Date(form.kickoffAt)
          return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
        })()
      : undefined

    if (kickoffAt === null) {
      setMessage('Starttiden har ogiltigt format.')
      return
    }

    const match: MatchDetails = {
      homeTeam: form.homeTeam.trim(),
      awayTeam: form.awayTeam.trim(),
      league: form.league.trim() || undefined,
      kickoffAt,
    }

    if (!match.homeTeam || !match.awayTeam) {
      setMessage('Hemmalag och bortalag måste anges.')
      return
    }

    try {
      await onSave(createCandidate(match, odds, evaluation))
      setForm(initialState)
      setMessage('Kandidaten sparades.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kandidaten kunde inte sparas.')
    }
  }

  return (
    <form className="panel stacked" onSubmit={handleSubmit}>
      <div className="grid two">
        <label>
          Hemmalag
          <input value={form.homeTeam} onChange={(event) => setForm({ ...form, homeTeam: event.target.value })} />
        </label>
        <label>
          Bortalag
          <input value={form.awayTeam} onChange={(event) => setForm({ ...form, awayTeam: event.target.value })} />
        </label>
        <label>
          Liga
          <input value={form.league} onChange={(event) => setForm({ ...form, league: event.target.value })} />
        </label>
        <label>
          Starttid
          <input
            type="datetime-local"
            value={form.kickoffAt}
            onChange={(event) => setForm({ ...form, kickoffAt: event.target.value })}
          />
        </label>
      </div>

      <div className="grid odds-grid">
        <label>
          Hemmaodds
          <input value={form.home} onChange={(event) => setForm({ ...form, home: event.target.value })} />
        </label>
        <label>
          Drawodds
          <input value={form.draw} onChange={(event) => setForm({ ...form, draw: event.target.value })} />
        </label>
        <label>
          Bortaodds
          <input value={form.away} onChange={(event) => setForm({ ...form, away: event.target.value })} />
        </label>
        <label>
          Över 2,5-odds
          <input value={form.over25} onChange={(event) => setForm({ ...form, over25: event.target.value })} />
        </label>
        <label>
          Under 2,5-odds
          <input value={form.under25} onChange={(event) => setForm({ ...form, under25: event.target.value })} />
        </label>
      </div>

      {evaluation ? (
        <div className="panel subtle">
          <h3>Direktanalys</h3>
          <p>
            Score: <strong>{evaluation.ltdScore}</strong> | Klassificering:{' '}
            <strong>{evaluation.classification}</strong>
          </p>
          <p>
            Draw: {(evaluation.oneXTwo.draw * 100).toFixed(1)} % | Över 2,5:{' '}
            {(evaluation.overUnder.over25 * 100).toFixed(1)} % | Favorit:{' '}
            {(evaluation.favoriteProbability * 100).toFixed(1)} %
          </p>
          <p>{evaluation.summary}</p>
          <ul className="plain-list">
            {evaluation.passedRules.map((rule) => (
              <li key={rule}>Godkänt: {rule}</li>
            ))}
            {evaluation.failedRules.map((rule) => (
              <li key={rule}>Underkänt: {rule}</li>
            ))}
            {evaluation.warnings.map((warning) => (
              <li key={warning}>Varning: {warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">Beräkningen visas automatiskt när alla odds är giltiga och större än 1.</p>
      )}

      {message ? <p className="status-message">{message}</p> : null}

      <button className="primary-button" type="submit">
        Spara kandidat
      </button>
    </form>
  )
}
