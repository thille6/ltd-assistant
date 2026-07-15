export function toIsoNow(): string {
  return new Date().toISOString()
}

export function formatDateTime(value?: string): string {
  if (!value) {
    return 'Ej angiven'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Ogiltigt datum'
  }

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatDate(value: string): string {
  const date = new Date(value)

  return new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'short',
  }).format(date)
}
