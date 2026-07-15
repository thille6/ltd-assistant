import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '../components/layout/AppShell'
import { BackupPage } from '../pages/BackupPage'
import { DashboardPage } from '../pages/DashboardPage'
import { JournalPage } from '../pages/JournalPage'
import { LiveAssistantPage } from '../pages/LiveAssistantPage'
import { MatchAnalysisPage } from '../pages/MatchAnalysisPage'
import { NewMatchPage } from '../pages/NewMatchPage'
import { SettingsPage } from '../pages/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/match/new" element={<NewMatchPage />} />
        <Route path="/match/:id" element={<MatchAnalysisPage />} />
        <Route path="/live/:id" element={<LiveAssistantPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/backup" element={<BackupPage />} />
      </Route>
    </Routes>
  )
}
