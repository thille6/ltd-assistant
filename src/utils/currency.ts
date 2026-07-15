import { roundTo } from './numbers'

export function formatCurrency(value: number | null): string {
  if (value === null) {
    return 'Ej beräknad'
  }

  return `${roundTo(value, 2)}`
}
