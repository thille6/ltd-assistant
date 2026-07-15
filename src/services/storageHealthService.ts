import { repository } from '../repositories/IndexedDbRepository'
import { loadSettings } from '../storage/settingsStorage'

export async function checkStorageHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    await repository.getCandidates()
    await repository.getTrades()
    loadSettings()

    return {
      ok: true,
      message: 'Lokal lagring fungerar som förväntat.',
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Lokal lagring kunde inte valideras. Exportera data eller återställ lagringen.',
    }
  }
}
