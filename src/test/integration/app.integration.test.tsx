import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '../../app/App'

async function createCandidateFlow(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('link', { name: 'Ny match' }))
  await user.type(screen.getByLabelText('Hemmalag'), 'Malmö')
  await user.type(screen.getByLabelText('Bortalag'), 'Hammarby')
  await user.type(screen.getByLabelText('Starttid'), '2026-07-15T19:30')
  await user.type(screen.getByLabelText('Hemmaodds'), '1.9')
  await user.type(screen.getByLabelText('Drawodds'), '3.9')
  await user.type(screen.getByLabelText('Bortaodds'), '4.8')
  await user.type(screen.getByLabelText('Över 2,5-odds'), '1.7')
  await user.type(screen.getByLabelText('Under 2,5-odds'), '2.2')
  await user.click(screen.getByRole('button', { name: 'Spara kandidat' }))
  await waitFor(() => expect(screen.getByText('Kandidaten sparades.')).toBeInTheDocument())
}

async function deleteDatabase() {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('ltd-assistant-db')
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
    request.onblocked = () => resolve()
  })
}

describe('app integration', () => {
  beforeEach(async () => {
    await deleteDatabase()
    window.localStorage.clear()
    window.location.hash = '#/dashboard'
  })

  it('creates a candidate, saves a snapshot, persists data and rejects invalid import preview', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    await createCandidateFlow(user)

    await user.click(screen.getByRole('link', { name: 'Dashboard' }))
    await screen.findByText('Malmö vs Hammarby')
    await user.click(screen.getByRole('link', { name: 'Starta liveassistent' }))

    await user.clear(screen.getByLabelText('Aktuell minut'))
    await user.type(screen.getByLabelText('Aktuell minut'), '20')
    await user.tab()
    await user.type(screen.getByLabelText('Layodds'), '2.4')
    await user.tab()
    await user.type(screen.getByLabelText('Total live-xG'), '0.6')
    await user.tab()
    await user.click(screen.getByRole('button', { name: /Hemmaskott/ }))
    await user.click(screen.getByRole('button', { name: /Hemmaskott/ }))
    await user.click(screen.getByRole('button', { name: /Bortaskott/ }))
    await user.click(screen.getByRole('button', { name: /Bortaskott/ }))
    await user.click(screen.getByRole('button', { name: /Hemma skott på mål/ }))
    await user.click(screen.getByRole('button', { name: /Borta skott på mål/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'PLAY' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Spara snapshot' }))
    await user.click(screen.getByRole('button', { name: 'Spara trade' }))
    await user.click(screen.getByRole('link', { name: 'Journal' }))

    await screen.findByText('Malmö vs Hammarby')

    unmount()
    render(<App />)
    await screen.findByText('Malmö vs Hammarby')

    await user.click(screen.getByRole('link', { name: 'Backup' }))
    await user.click(screen.getByRole('textbox'))
    await user.paste('{"invalid":true}')
    await screen.findByText(/Invalid input/i)
  })
})
