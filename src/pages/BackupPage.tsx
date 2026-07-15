import { useState } from 'react'

import { useAppContext } from '../app/AppContext'
import { parseExportBundle } from '../services/backupService'
import { downloadTextFile } from '../utils/downloads'

export function BackupPage() {
  const { exportData, importData } = useAppContext()
  const [importText, setImportText] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof parseExportBundle> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleExportJson() {
    const json = await exportData()
    downloadTextFile('ltd-assistant-backup.json', json, 'application/json;charset=utf-8')
    setMessage('JSON-backup exporterad.')
  }

  async function handleImport(mode: 'merge' | 'replace') {
    if (!preview) {
      return
    }

    if (mode === 'replace') {
      const automaticBackup = await exportData()
      downloadTextFile('ltd-assistant-auto-backup.json', automaticBackup, 'application/json;charset=utf-8')
    }

    await importData(importText, mode)
    setMessage(mode === 'merge' ? 'Backup importerad och sammanslagen.' : 'Backup importerad och befintlig data ersatt.')
  }

  return (
    <section className="stacked">
      <section className="panel">
        <h2>Backup och export</h2>
        <p>Exportera full JSON-backup eller klistra in JSON för att förhandsgranska importen innan den körs.</p>
        <div className="button-row">
          <button type="button" className="primary-button" onClick={() => void handleExportJson()}>
            Exportera fullständig JSON-backup
          </button>
        </div>
      </section>

      <section className="panel">
        <h3>CSV-export för journal</h3>
        <p>Journalen kan exporteras från sidan Journal genom att ladda ner aktuell backup eller använda journalens data i JSON-flödet.</p>
      </section>

      <section className="panel stacked">
        <h3>Importera backup</h3>
        <label>
          Välj JSON-fil
          <input
            type="file"
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) {
                return
              }

              const text = await file.text()
              setImportText(text)

              try {
                const nextPreview = parseExportBundle(text)
                setPreview(nextPreview)
                setError(null)
              } catch (nextError) {
                setPreview(null)
                setError(nextError instanceof Error ? nextError.message : 'Ogiltig backupfil.')
              }
            }}
          />
        </label>
        <textarea
          rows={12}
          value={importText}
          onChange={(event) => {
            setImportText(event.target.value)
            try {
              const nextPreview = parseExportBundle(event.target.value)
              setPreview(nextPreview)
              setError(null)
            } catch (nextError) {
              setPreview(null)
              setError(nextError instanceof Error ? nextError.message : 'Ogiltig backupfil.')
            }
          }}
        />

        {preview ? (
          <div className="panel subtle">
            <p>SchemaVersion: {preview.schemaVersion}</p>
            <p>Kandidater: {preview.candidates.length}</p>
            <p>Trades: {preview.trades.length}</p>
            <p>Live snapshots: {preview.liveSnapshots.length}</p>
            <div className="button-row">
              <button type="button" onClick={() => void handleImport('merge')}>
                Slå ihop med befintlig data
              </button>
              <button type="button" className="danger-button" onClick={() => void handleImport('replace')}>
                Ersätt befintlig data
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="status-message error-text">{error}</p> : null}
        {message ? <p className="status-message">{message}</p> : null}
      </section>
    </section>
  )
}
