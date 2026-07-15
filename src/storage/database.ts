import { openDB } from 'idb'

import type { Candidate } from '../domain/candidate/types'
import type { LiveSnapshot } from '../domain/live/types'
import type { Trade } from '../domain/trade/types'
import type { StoredEnvelope } from './storageEnvelope'

export interface LtdAssistantDb {
  candidates: {
    key: string
    value: StoredEnvelope<Candidate>
  }
  liveSnapshots: {
    key: string
    value: StoredEnvelope<LiveSnapshot>
    indexes: { 'by-candidate': string }
  }
  trades: {
    key: string
    value: StoredEnvelope<Trade>
  }
  exportMetadata: {
    key: string
    value: StoredEnvelope<{ lastExportedAt: string | null }>
  }
}

export const DATABASE_NAME = 'ltd-assistant-db'
export const DATABASE_VERSION = 1

export async function openLtdAssistantDb() {
  return openDB<LtdAssistantDb>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('candidates')) {
        db.createObjectStore('candidates')
      }

      if (!db.objectStoreNames.contains('liveSnapshots')) {
        const store = db.createObjectStore('liveSnapshots')
        store.createIndex('by-candidate', 'data.candidateId')
      }

      if (!db.objectStoreNames.contains('trades')) {
        db.createObjectStore('trades')
      }

      if (!db.objectStoreNames.contains('exportMetadata')) {
        db.createObjectStore('exportMetadata')
      }
    },
  })
}
