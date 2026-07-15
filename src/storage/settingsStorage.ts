import { defaultModelSettings, type ModelSettings } from '../domain/settings/types'
import { settingsSchema } from '../schemas/settingsSchema'

const SETTINGS_KEY = 'ltd-assistant.settings'

export function loadSettings(): ModelSettings {
  const raw = window.localStorage.getItem(SETTINGS_KEY)

  if (!raw) {
    return defaultModelSettings
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return settingsSchema.parse(parsed)
  } catch {
    throw new Error('Inställningarna kunde inte läsas. Exportera data eller återställ inställningarna.')
  }
}

export function saveSettings(settings: ModelSettings): void {
  const validated = settingsSchema.parse(settings)
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(validated))
}

export function resetSettings(): ModelSettings {
  saveSettings(defaultModelSettings)
  return defaultModelSettings
}
