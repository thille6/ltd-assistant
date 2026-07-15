import { APP_VERSION, SCHEMA_VERSION } from '../domain/settings/types'
import { toIsoNow } from '../utils/dates'

export interface StoredEnvelope<T> {
  schemaVersion: number
  appVersion: string
  updatedAt: string
  data: T
}

export function createStoredEnvelope<T>(data: T): StoredEnvelope<T> {
  return {
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    updatedAt: toIsoNow(),
    data,
  }
}
