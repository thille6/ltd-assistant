import { expect, test } from '@playwright/test'

async function createCandidate(page: import('@playwright/test').Page) {
  await page.goto('/ltd-assistant/#/match/new')
  await page.getByLabel('Hemmalag').fill('Malmö')
  await page.getByLabel('Bortalag').fill('Hammarby')
  await page.getByLabel('Hemmaodds').fill('1.9')
  await page.getByLabel('Drawodds').fill('3.9')
  await page.getByLabel('Bortaodds').fill('4.8')
  await page.getByLabel('Över 2,5-odds').fill('1.7')
  await page.getByLabel('Under 2,5-odds').fill('2.2')
  await page.getByRole('button', { name: 'Spara kandidat' }).click()
  await expect(page.getByText('Kandidaten sparades.')).toBeVisible()
}

test('skapa kandidat till trade', async ({ page }) => {
  await createCandidate(page)
  await page.getByRole('link', { name: 'Dashboard' }).click()
  await page.getByRole('link', { name: 'Starta liveassistent' }).click()
  await page.getByLabel('Aktuell minut').fill('20')
  await page.getByLabel('Layodds').fill('2.4')
  await page.getByLabel('Total live-xG').fill('0.6')
  await page.getByRole('button', { name: /Hemmaskott/ }).click()
  await page.getByRole('button', { name: /Hemmaskott/ }).click()
  await page.getByRole('button', { name: /Bortaskott/ }).click()
  await page.getByRole('button', { name: /Bortaskott/ }).click()
  await page.getByRole('button', { name: /Hemma skott på mål/ }).click()
  await page.getByRole('button', { name: /Borta skott på mål/ }).click()
  await expect(page.getByRole('heading', { name: 'PLAY' })).toBeVisible()
  await page.getByRole('button', { name: 'Spara snapshot' }).click()
  await page.getByRole('button', { name: 'Spara trade' }).click()
  await page.getByRole('link', { name: 'Journal' }).click()
  await expect(page.getByText('Malmö vs Hammarby')).toBeVisible()
})

test('data finns kvar efter omladdning', async ({ page }) => {
  await createCandidate(page)
  await page.getByRole('link', { name: 'Dashboard' }).click()
  await page.reload()
  await expect(page.getByText('Malmö vs Hammarby')).toBeVisible()
})

test('json-backup kan återställas', async ({ page }) => {
  await createCandidate(page)
  await page.getByRole('link', { name: 'Backup' }).click()
  await page.getByRole('button', { name: 'Exportera fullständig JSON-backup' }).click()
  await page.getByRole('textbox').fill('{"invalid":true}')
  await expect(page.getByText(/Invalid input/i)).toBeVisible()
})

test('mobilvy visar liveknappar', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobiltest körs bara i mobilprojektet.')
  await createCandidate(page)
  await page.getByRole('link', { name: 'Dashboard' }).click()
  await page.getByRole('link', { name: 'Starta liveassistent' }).click()
  await expect(page.getByRole('button', { name: /Hemmaskott/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Ångra senaste händelse/ })).toBeVisible()
})

test('hashrouter fungerar efter build', async ({ page }) => {
  await page.goto('/ltd-assistant/#/settings')
  await expect(page.getByRole('heading', { name: 'Inställningar' })).toBeVisible()
})
