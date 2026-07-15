import type { Candidate } from '../domain/candidate/types'
import type { LiveSnapshot } from '../domain/live/types'
import type { Trade } from '../domain/trade/types'
import type { DataRepository } from './DataRepository'
import { candidateSchema } from '../schemas/candidateSchema'
import { liveSnapshotSchema } from '../schemas/liveSnapshotSchema'
import { tradeSchema } from '../schemas/tradeSchema'
import { openLtdAssistantDb } from '../storage/database'
import { migrateEnvelope } from '../storage/migrations'
import { createStoredEnvelope } from '../storage/storageEnvelope'

export class IndexedDbRepository implements DataRepository {
  async getCandidates(): Promise<Candidate[]> {
    const db = await openLtdAssistantDb()
    const rows = await db.getAll('candidates')

    return rows
      .map((row) => migrateEnvelope(row).data)
      .map((candidate) => candidateSchema.parse(candidate))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async saveCandidate(candidate: Candidate): Promise<void> {
    candidateSchema.parse(candidate)
    const db = await openLtdAssistantDb()
    await db.put('candidates', createStoredEnvelope(candidate), candidate.id)
  }

  async deleteCandidate(id: string): Promise<void> {
    const db = await openLtdAssistantDb()
    await db.delete('candidates', id)
  }

  async getAllLiveSnapshots(): Promise<LiveSnapshot[]> {
    const db = await openLtdAssistantDb()
    const rows = await db.getAll('liveSnapshots')

    return rows
      .map((row) => migrateEnvelope(row).data)
      .map((snapshot) => liveSnapshotSchema.parse(snapshot))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async getLiveSnapshots(candidateId: string): Promise<LiveSnapshot[]> {
    const db = await openLtdAssistantDb()
    const rows = await db.getAllFromIndex('liveSnapshots', 'by-candidate', candidateId)

    return rows
      .map((row) => migrateEnvelope(row).data)
      .map((snapshot) => liveSnapshotSchema.parse(snapshot))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async saveLiveSnapshot(snapshot: LiveSnapshot): Promise<void> {
    liveSnapshotSchema.parse(snapshot)
    const db = await openLtdAssistantDb()
    await db.put('liveSnapshots', createStoredEnvelope(snapshot), snapshot.id)
  }

  async getTrades(): Promise<Trade[]> {
    const db = await openLtdAssistantDb()
    const rows = await db.getAll('trades')

    return rows
      .map((row) => migrateEnvelope(row).data)
      .map((trade) => tradeSchema.parse(trade))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async saveTrade(trade: Trade): Promise<void> {
    tradeSchema.parse(trade)
    const db = await openLtdAssistantDb()
    await db.put('trades', createStoredEnvelope(trade), trade.id)
  }

  async deleteTrade(id: string): Promise<void> {
    const db = await openLtdAssistantDb()
    await db.delete('trades', id)
  }

  async clearAllData(): Promise<void> {
    const db = await openLtdAssistantDb()
    await Promise.all([
      db.clear('candidates'),
      db.clear('liveSnapshots'),
      db.clear('trades'),
      db.clear('exportMetadata'),
    ])
  }
}

export const repository = new IndexedDbRepository()
