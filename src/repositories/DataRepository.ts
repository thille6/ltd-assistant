import type { Candidate } from '../domain/candidate/types'
import type { LiveSnapshot } from '../domain/live/types'
import type { Trade } from '../domain/trade/types'

export interface DataRepository {
  getCandidates(): Promise<Candidate[]>
  saveCandidate(candidate: Candidate): Promise<void>
  deleteCandidate(id: string): Promise<void>

  getAllLiveSnapshots(): Promise<LiveSnapshot[]>
  getLiveSnapshots(candidateId: string): Promise<LiveSnapshot[]>
  saveLiveSnapshot(snapshot: LiveSnapshot): Promise<void>

  getTrades(): Promise<Trade[]>
  saveTrade(trade: Trade): Promise<void>
  deleteTrade(id: string): Promise<void>
  clearAllData(): Promise<void>
}
