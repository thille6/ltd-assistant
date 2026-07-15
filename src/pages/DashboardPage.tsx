import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { EmptyState } from '../components/feedback/EmptyState'
import { useAppContext } from '../app/AppContext'
import { formatDateTime } from '../utils/dates'
import { toPercent } from '../utils/numbers'

export function DashboardPage() {
  const { candidates, deleteCandidate, duplicateCandidateById, saveCandidate } = useAppContext()
  const [classification, setClassification] = useState<'all' | 'strong' | 'possible' | 'watch' | 'reject'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'time'>('score')

  const visibleCandidates = useMemo(() => {
    const filtered = candidates.filter((candidate) =>
      classification === 'all' ? true : candidate.evaluation.classification === classification,
    )

    return filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return b.evaluation.ltdScore - a.evaluation.ltdScore
      }

      return (a.match.kickoffAt ?? '').localeCompare(b.match.kickoffAt ?? '')
    })
  }, [candidates, classification, sortBy])

  if (candidates.length === 0) {
    return (
      <EmptyState
        title="Inga kandidater ännu"
        description="Lägg in din första match på sidan Ny match för att börja arbeta med LTD-flödet."
      />
    )
  }

  return (
    <section className="stacked">
      <div className="panel toolbar">
        <label>
          Filtrera
          <select value={classification} onChange={(event) => setClassification(event.target.value as typeof classification)}>
            <option value="all">Alla</option>
            <option value="strong">Stark</option>
            <option value="possible">Möjlig</option>
            <option value="watch">Bevaka</option>
            <option value="reject">Avstå</option>
          </select>
        </label>

        <label>
          Sortera
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="score">Score</option>
            <option value="time">Starttid</option>
          </select>
        </label>
      </div>

      <div className="candidate-list">
        {visibleCandidates.map((candidate) => (
          <article className="panel" key={candidate.id}>
            <div className="candidate-header">
              <div>
                <h2>
                  {candidate.match.homeTeam} vs {candidate.match.awayTeam}
                </h2>
                <p>
                  Start: {formatDateTime(candidate.match.kickoffAt)} | Status: {candidate.status} | Senaste livebeslut:{' '}
                  {candidate.latestLiveDecision ?? 'Inget'}
                </p>
              </div>
              <span className={`badge badge-${candidate.evaluation.classification}`}>
                {candidate.evaluation.classification} ({candidate.evaluation.ltdScore})
              </span>
            </div>

            <div className="inline-stats">
              <span>Draw {toPercent(candidate.evaluation.oneXTwo.draw)}</span>
              <span>Över 2,5 {toPercent(candidate.evaluation.overUnder.over25)}</span>
              <span>Favorit {toPercent(candidate.evaluation.favoriteProbability)}</span>
            </div>

            <p>{candidate.evaluation.summary}</p>

            <div className="button-row">
              <Link className="button-link" to={`/match/${candidate.id}`}>
                Öppna analys
              </Link>
              <Link className="button-link" to={`/live/${candidate.id}`}>
                Starta liveassistent
              </Link>
              <button type="button" onClick={() => void duplicateCandidateById(candidate.id)}>
                Duplicera
              </button>
              <button
                type="button"
                onClick={() =>
                  void saveCandidate({
                    ...candidate,
                    status: candidate.status === 'active' ? 'archived' : 'active',
                    updatedAt: new Date().toISOString(),
                  })
                }
              >
                {candidate.status === 'active' ? 'Arkivera' : 'Återaktivera'}
              </button>
              <button type="button" className="danger-button" onClick={() => void deleteCandidate(candidate.id)}>
                Radera
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
