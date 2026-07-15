import { CandidateForm } from '../components/forms/CandidateForm'
import { useAppContext } from '../app/AppContext'

export function NewMatchPage() {
  const { settings, saveCandidate } = useAppContext()

  return (
    <section className="stacked">
      <div className="panel">
        <h2>Ny match</h2>
        <p>Registrera prematchodds. Analysen visas direkt när alla odds är giltiga.</p>
      </div>

      <CandidateForm settings={settings} onSave={saveCandidate} />
    </section>
  )
}
