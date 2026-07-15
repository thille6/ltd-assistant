import { Link, useParams } from 'react-router-dom'

import { EmptyState } from '../components/feedback/EmptyState'
import { useAppContext } from '../app/AppContext'
import { formatDateTime } from '../utils/dates'
import { toPercent } from '../utils/numbers'

export function MatchAnalysisPage() {
  const { id } = useParams()
  const { candidates, settings } = useAppContext()
  const candidate = candidates.find((item) => item.id === id)

  if (!candidate) {
    return <EmptyState title="Kandidaten hittades inte" description="Välj en befintlig kandidat från dashboarden." />
  }

  return (
    <section className="stacked">
      <div className="panel">
        <h2>
          {candidate.match.homeTeam} vs {candidate.match.awayTeam}
        </h2>
        <p>
          Liga: {candidate.match.league ?? 'Ej angiven'} | Start: {formatDateTime(candidate.match.kickoffAt)}
        </p>
        <p>Modellversion: {candidate.evaluation.modelVersion}</p>
      </div>

      <div className="grid two">
        <section className="panel">
          <h3>Odds och sannolikheter</h3>
          <ul className="plain-list">
            <li>Hemmaodds: {candidate.odds.home}</li>
            <li>Drawodds: {candidate.odds.draw}</li>
            <li>Bortaodds: {candidate.odds.away}</li>
            <li>Över 2,5-odds: {candidate.odds.over25}</li>
            <li>Under 2,5-odds: {candidate.odds.under25}</li>
            <li>Marginalfri draw: {toPercent(candidate.evaluation.oneXTwo.draw)}</li>
            <li>Marginalfri över 2,5: {toPercent(candidate.evaluation.overUnder.over25)}</li>
            <li>Favoritstyrka: {toPercent(candidate.evaluation.favoriteProbability)}</li>
          </ul>
        </section>

        <section className="panel">
          <h3>Bedömning</h3>
          <p>
            LTD-score: <strong>{candidate.evaluation.ltdScore}</strong>
          </p>
          <p>Klassificering: {candidate.evaluation.classification}</p>
          <p>{candidate.evaluation.summary}</p>
          <ul className="plain-list">
            {candidate.evaluation.passedRules.map((rule) => (
              <li key={rule}>Godkänt: {rule}</li>
            ))}
            {candidate.evaluation.failedRules.map((rule) => (
              <li key={rule}>Underkänt: {rule}</li>
            ))}
            {candidate.evaluation.warnings.map((warning) => (
              <li key={warning}>Varning: {warning}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h3>Använda modellinställningar</h3>
        <div className="inline-stats">
          <span>Max draw {toPercent(settings.maxDrawProbability)}</span>
          <span>Min över 2,5 {toPercent(settings.minOver25Probability)}</span>
          <span>Favoritintervall {toPercent(settings.minFavoriteProbability)} till {toPercent(settings.maxFavoriteProbability)}</span>
          <span>Min score {settings.minCandidateScore}</span>
        </div>
        <Link className="button-link" to={`/live/${candidate.id}`}>
          Öppna liveassistenten
        </Link>
      </section>
    </section>
  )
}
