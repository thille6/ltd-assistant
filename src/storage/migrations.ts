import { SCHEMA_VERSION } from '../domain/settings/types'
import type { StoredEnvelope } from './storageEnvelope'

export function ensureSupportedSchema<T>(value: StoredEnvelope<T>): StoredEnvelope<T> {
  if (value.schemaVersion > SCHEMA_VERSION) {
    throw new Error('Lagringen kommer från en nyare version och kan inte läsas säkert.')
  }

  return value
}

export function migrateEnvelope<T>(value: StoredEnvelope<T>): StoredEnvelope<T> {
  return ensureSupportedSchema(value)
}
