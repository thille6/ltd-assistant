import { useMemo, useState } from 'react'

import { useAppContext } from '../app/AppContext'
import { defaultModelSettings, type ModelSettings } from '../domain/settings/types'
import { downloadTextFile } from '../utils/downloads'
import { safeNumber } from '../utils/numbers'

type SettingsKey = keyof ModelSettings

const editableFields: Array<{ key: SettingsKey; label: string }> = [
  { key: 'maxDrawProbability', label: 'Maximal draw-sannolikhet' },
  { key: 'minOver25Probability', label: 'Minsta över 2,5-sannolikhet' },
  { key: 'minFavoriteProbability', label: 'Minsta favoritsannolikhet' },
  { key: 'maxFavoriteProbability', label: 'Maximal favoritsannolikhet' },
  { key: 'minCandidateScore', label: 'Minsta kandidat-score' },
  { key: 'minPlayScore', label: 'Minsta PLAY-score' },
  { key: 'earliestEntryMinute', label: 'Tidigaste entryminut' },
  { key: 'latestEntryMinute', label: 'Senaste entryminut' },
  { key: 'minShotsTotal', label: 'Minsta antal skott' },
  { key: 'minShotsOnTargetTotal', label: 'Minsta antal skott på mål' },
  { key: 'minLiveXg', label: 'Minsta live-xG' },
  { key: 'defaultBankroll', label: 'Standardbankrulle' },
  { key: 'defaultRiskPercent', label: 'Standardriskprocent' },
  { key: 'commissionPercent', label: 'Kommission' },
]

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useAppContext()
  const [draft, setDraft] = useState(settings)

  const exportJson = useMemo(() => JSON.stringify({ settings: draft }, null, 2), [draft])

  function updateNumberField(key: SettingsKey, value: string) {
    const parsed = safeNumber(value)
    if (parsed === null) {
      return
    }

    setDraft({ ...draft, [key]: parsed })
  }

  return (
    <section className="stacked">
      <section className="panel">
        <h2>Inställningar</h2>
        <p>
          Modellversion: {settings.modelVersion} | SchemaVersion: {settings.schemaVersion}
        </p>
      </section>

      <section className="panel">
        <div className="grid two">
          {editableFields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input value={draft[field.key] as number} onChange={(event) => updateNumberField(field.key, event.target.value)} />
            </label>
          ))}
        </div>

        <div className="inline-stats">
          <span>Standard max draw: {defaultModelSettings.maxDrawProbability}</span>
          <span>Standard min över 2,5: {defaultModelSettings.minOver25Probability}</span>
          <span>Standard bankrulle: {defaultModelSettings.defaultBankroll}</span>
        </div>

        <div className="button-row">
          <button type="button" className="primary-button" onClick={() => updateSettings(draft)}>
            Spara inställningar
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Återställ till standardvärden?')) {
                resetSettings()
                setDraft(defaultModelSettings)
              }
            }}
          >
            Återställ standardvärden
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile('ltd-settings.json', exportJson, 'application/json;charset=utf-8')}
          >
            Exportera settings
          </button>
        </div>
      </section>
    </section>
  )
}
