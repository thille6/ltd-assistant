export interface MatchDetails {
  homeTeam: string
  awayTeam: string
  league?: string
  kickoffAt?: string
}

export interface PrematchOdds {
  home: number
  draw: number
  away: number
  over25: number
  under25: number
}

export type CandidateClassification = 'strong' | 'possible' | 'watch' | 'reject'

export interface OneXTwoProbabilities {
  home: number
  draw: number
  away: number
  overround: number
}

export interface OverUnderProbabilities {
  over25: number
  under25: number
  overround: number
}

export interface PrematchEvaluation {
  oneXTwo: OneXTwoProbabilities
  overUnder: OverUnderProbabilities
  favoriteProbability: number
  ltdScore: number
  classification: CandidateClassification
  passedRules: string[]
  failedRules: string[]
  warnings: string[]
  summary: string
  modelVersion: string
  evaluatedAt: string
}
