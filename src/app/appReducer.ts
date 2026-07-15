import type { Candidate } from '../domain/candidate/types'
import type { ModelSettings } from '../domain/settings/types'
import type { Trade } from '../domain/trade/types'

export interface AppState {
  candidates: Candidate[]
  trades: Trade[]
  settings: ModelSettings
  loading: boolean
  storageError: string | null
}

export type AppAction =
  | { type: 'loading'; payload: boolean }
  | {
      type: 'hydrate'
      payload: Pick<AppState, 'candidates' | 'trades' | 'settings'>
    }
  | { type: 'storage-error'; payload: string | null }
  | { type: 'upsert-candidate'; payload: Candidate }
  | { type: 'delete-candidate'; payload: string }
  | { type: 'upsert-trade'; payload: Trade }
  | { type: 'delete-trade'; payload: string }
  | { type: 'set-settings'; payload: ModelSettings }

export function upsertById<T extends { id: string }>(items: T[], nextItem: T): T[] {
  const existing = items.find((item) => item.id === nextItem.id)

  if (!existing) {
    return [nextItem, ...items]
  }

  return items.map((item) => (item.id === nextItem.id ? nextItem : item))
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: action.payload }
    case 'hydrate':
      return {
        ...state,
        candidates: action.payload.candidates,
        trades: action.payload.trades,
        settings: action.payload.settings,
        loading: false,
      }
    case 'storage-error':
      return { ...state, storageError: action.payload, loading: false }
    case 'upsert-candidate':
      return { ...state, candidates: upsertById(state.candidates, action.payload) }
    case 'delete-candidate':
      return { ...state, candidates: state.candidates.filter((candidate) => candidate.id !== action.payload) }
    case 'upsert-trade':
      return { ...state, trades: upsertById(state.trades, action.payload) }
    case 'delete-trade':
      return { ...state, trades: state.trades.filter((trade) => trade.id !== action.payload) }
    case 'set-settings':
      return { ...state, settings: action.payload }
    default:
      return state
  }
}
