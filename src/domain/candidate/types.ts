import type { LiveDecisionStatus } from '../live/types'
import type { MatchDetails, PrematchEvaluation, PrematchOdds } from '../match/types'

export type CandidateStatus = 'active' | 'archived'

export interface Candidate {
  id: string
  match: MatchDetails
  odds: PrematchOdds
  evaluation: PrematchEvaluation
  status: CandidateStatus
  latestLiveDecision: LiveDecisionStatus | null
  createdAt: string
  updatedAt: string
  schemaVersion: number
  appVersion: string
}
