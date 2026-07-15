export type LiveDecisionStatus = 'play' | 'wait' | 'skip'
export type LiveEventType =
  | 'home-shot'
  | 'away-shot'
  | 'home-shot-on-target'
  | 'away-shot-on-target'
  | 'home-goal'
  | 'away-goal'
  | 'home-red-card'
  | 'away-red-card'
  | 'minute-adjust'
  | 'snapshot-saved'

export interface LiveStats {
  minute: number
  homeGoals: number
  awayGoals: number
  homeShots: number
  awayShots: number
  homeShotsOnTarget: number
  awayShotsOnTarget: number
  homeRedCards: number
  awayRedCards: number
  liveXg: number | null
  layOdds: number | null
}

export interface LiveDecision {
  status: LiveDecisionStatus
  mainReason: string
  supportingReasons: string[]
  warnings: string[]
  blockingRule: string | null
  recommendedLayStake: number | null
  liability: number | null
  evaluatedAt: string
}

export interface LiveEvent {
  id: string
  timestamp: string
  minute: number
  type: LiveEventType
  team: 'home' | 'away' | 'none'
  previousValue: number
  nextValue: number
}

export interface LiveSnapshot {
  id: string
  candidateId: string
  stats: LiveStats
  decision: LiveDecision
  events: LiveEvent[]
  createdAt: string
  updatedAt: string
  schemaVersion: number
  appVersion: string
}
