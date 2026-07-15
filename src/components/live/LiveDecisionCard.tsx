import type { LiveDecision } from '../../domain/live/types'
import { formatCurrency } from '../../utils/currency'

export function LiveDecisionCard({ decision }: { decision: LiveDecision }) {
  return (
    <section className={`panel decision-card decision-${decision.status}`}>
      <h3>{decision.status.toUpperCase()}</h3>
      <p>{decision.mainReason}</p>
      <p>Blockerande regel: {decision.blockingRule ?? 'Ingen, PLAY är tillåtet.'}</p>
      <p>
        Liability: {formatCurrency(decision.liability)} | Rekommenderad layinsats:{' '}
        {formatCurrency(decision.recommendedLayStake)}
      </p>
      <ul className="plain-list">
        {decision.supportingReasons.map((reason) => (
          <li key={reason}>Orsak: {reason}</li>
        ))}
        {decision.warnings.map((warning) => (
          <li key={warning}>Varning: {warning}</li>
        ))}
      </ul>
    </section>
  )
}
