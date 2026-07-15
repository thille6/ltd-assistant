export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function roundTo(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function toPercent(value: number, decimals = 1): string {
  return `${roundTo(value * 100, decimals)} %`
}

export function safeNumber(value: string): number | null {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}
