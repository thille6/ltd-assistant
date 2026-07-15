import type { LiveEventType } from '../../domain/live/types'

interface LiveControlPadProps {
  onApply(type: LiveEventType, amount?: number): void
  onUndo(): void
}

const controls: Array<{ label: string; shortcut: string; type: LiveEventType; team?: 'home' | 'away' }> = [
  { label: 'Hemmaskott +1', shortcut: 'H', type: 'home-shot', team: 'home' },
  { label: 'Bortaskott +1', shortcut: 'B', type: 'away-shot', team: 'away' },
  { label: 'Hemma skott på mål +1', shortcut: 'J', type: 'home-shot-on-target', team: 'home' },
  { label: 'Borta skott på mål +1', shortcut: 'N', type: 'away-shot-on-target', team: 'away' },
  { label: 'Hemmamål', shortcut: 'M', type: 'home-goal', team: 'home' },
  { label: 'Bortamål', shortcut: 'Shift+M', type: 'away-goal', team: 'away' },
  { label: 'Rött kort hemma', shortcut: 'R', type: 'home-red-card', team: 'home' },
  { label: 'Rött kort borta', shortcut: 'Shift+R', type: 'away-red-card', team: 'away' },
]

export function LiveControlPad({ onApply, onUndo }: LiveControlPadProps) {
  return (
    <section className="panel">
      <h3>Snabbregistrering</h3>
      <div className="live-grid">
        {controls.map((control) => (
          <button
            key={`${control.type}-${control.shortcut}`}
            type="button"
            className="action-button"
            aria-keyshortcuts={control.shortcut.toLowerCase()}
            onClick={() => onApply(control.type)}
          >
            <span>{control.label}</span>
            <strong>{control.shortcut}</strong>
          </button>
        ))}
        <button type="button" className="action-button" onClick={() => onApply('minute-adjust', 1)}>
          <span>Minut +1</span>
        </button>
        <button type="button" className="action-button" onClick={() => onApply('minute-adjust', 5)}>
          <span>Minut +5</span>
        </button>
        <button type="button" className="action-button" onClick={() => onApply('minute-adjust', -1)}>
          <span>Minut −1</span>
        </button>
        <button
          type="button"
          className="action-button danger-button"
          aria-keyshortcuts="Backspace"
          onClick={onUndo}
        >
          <span>Ångra senaste händelse</span>
          <strong>Backspace</strong>
        </button>
      </div>
    </section>
  )
}
