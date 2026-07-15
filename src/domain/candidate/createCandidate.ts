import type { Candidate } from './types'
import type { MatchDetails, PrematchEvaluation, PrematchOdds } from '../match/types'
import { APP_VERSION, SCHEMA_VERSION } from '../settings/types'
import { toIsoNow } from '../../utils/dates'

export function createCandidate(
  match: MatchDetails,
  odds: PrematchOdds,
  evaluation: PrematchEvaluation,
): Candidate {
  const now = toIsoNow()

  return {
    id: crypto.randomUUID(),
    match,
    odds,
    evaluation,
    status: 'active',
    latestLiveDecision: null,
    createdAt: now,
    updatedAt: now,
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
  }
}

export function duplicateCandidate(candidate: Candidate): Candidate {
  const now = toIsoNow()

  return {
    ...candidate,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }
}
