import { HashRouter } from 'react-router-dom'

import { ErrorBoundary } from '../components/feedback/ErrorBoundary'
import { AppProvider, useAppContext } from './AppContext'
import { AppRoutes } from './routes'

function AppStateBanner() {
  const { loading, storageError } = useAppContext()

  if (loading) {
    return <div className="app-banner">Laddar lokal data…</div>
  }

  if (storageError) {
    return <div className="app-banner error-banner">{storageError}</div>
  }

  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <AppStateBanner />
          <AppRoutes />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}
