import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

import { duplicateCandidate } from '../domain/candidate/createCandidate'
import type { Candidate } from '../domain/candidate/types'
import type { LiveSnapshot } from '../domain/live/types'
import { defaultModelSettings, type ModelSettings } from '../domain/settings/types'
import type { Trade } from '../domain/trade/types'
import { repository } from '../repositories/IndexedDbRepository'
import { createExportBundle, parseExportBundle, serializeExportBundle, type ExportBundle } from '../services/backupService'
import { loadSettings, resetSettings as resetStoredSettings, saveSettings } from '../storage/settingsStorage'
import { toIsoNow } from '../utils/dates'
import { appReducer, type AppState } from './appReducer'

interface AppContextValue extends AppState {
  reload(): Promise<void>
  saveCandidate(candidate: Candidate): Promise<void>
  deleteCandidate(id: string): Promise<void>
  duplicateCandidateById(id: string): Promise<void>
  saveTrade(trade: Trade): Promise<void>
  deleteTrade(id: string): Promise<void>
  getLiveSnapshots(candidateId: string): Promise<LiveSnapshot[]>
  saveLiveSnapshot(snapshot: LiveSnapshot): Promise<void>
  updateSettings(settings: ModelSettings): void
  resetSettings(): void
  exportData(): Promise<string>
  importData(json: string, mode: 'merge' | 'replace'): Promise<ExportBundle>
}

const initialState: AppState = {
  candidates: [],
  trades: [],
  settings: defaultModelSettings,
  loading: true,
  storageError: null,
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  async function reload() {
    dispatch({ type: 'loading', payload: true })

    try {
      const [candidates, trades] = await Promise.all([repository.getCandidates(), repository.getTrades()])
      const settings = loadSettings()

      dispatch({
        type: 'hydrate',
        payload: { candidates, trades, settings },
      })
      dispatch({ type: 'storage-error', payload: null })
    } catch (error) {
      dispatch({
        type: 'storage-error',
        payload: error instanceof Error ? error.message : 'Appen kunde inte läsa lokal data.',
      })
    }
  }

  useEffect(() => {
    void reload()
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      reload,
      async saveCandidate(candidate) {
        await repository.saveCandidate(candidate)
        dispatch({ type: 'upsert-candidate', payload: candidate })
      },
      async deleteCandidate(id) {
        await repository.deleteCandidate(id)
        dispatch({ type: 'delete-candidate', payload: id })
      },
      async duplicateCandidateById(id) {
        const candidate = state.candidates.find((item) => item.id === id)
        if (!candidate) {
          return
        }

        const copy = duplicateCandidate(candidate)
        await repository.saveCandidate(copy)
        dispatch({ type: 'upsert-candidate', payload: copy })
      },
      async saveTrade(trade) {
        await repository.saveTrade({ ...trade, updatedAt: toIsoNow() })
        dispatch({ type: 'upsert-trade', payload: { ...trade, updatedAt: toIsoNow() } })
      },
      async deleteTrade(id) {
        await repository.deleteTrade(id)
        dispatch({ type: 'delete-trade', payload: id })
      },
      async getLiveSnapshots(candidateId) {
        return repository.getLiveSnapshots(candidateId)
      },
      async saveLiveSnapshot(snapshot) {
        await repository.saveLiveSnapshot(snapshot)
      },
      updateSettings(settings) {
        saveSettings(settings)
        dispatch({ type: 'set-settings', payload: settings })
      },
      resetSettings() {
        const settings = resetStoredSettings()
        dispatch({ type: 'set-settings', payload: settings })
      },
      async exportData() {
        const liveSnapshots = await repository.getAllLiveSnapshots()
        const bundle = createExportBundle(state.candidates, liveSnapshots, state.trades, state.settings)
        return serializeExportBundle(bundle)
      },
      async importData(json, mode) {
        const bundle = parseExportBundle(json)

        if (mode === 'replace') {
          await repository.clearAllData()
        }

        await Promise.all(bundle.candidates.map((candidate) => repository.saveCandidate(candidate)))
        await Promise.all(bundle.liveSnapshots.map((snapshot) => repository.saveLiveSnapshot(snapshot)))
        await Promise.all(bundle.trades.map((trade) => repository.saveTrade(trade)))
        saveSettings(bundle.settings)

        await reload()
        return bundle
      },
    }),
    [state],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext måste användas inom AppProvider.')
  }

  return context
}
