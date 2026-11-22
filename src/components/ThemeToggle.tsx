import { useState } from 'react'
import { toggleMode, type Mode } from '../theme'

/** 右上角日间 / 夜间切换：图标 + 当前状态字，点击后记住选择 */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(
    () => (document.documentElement.dataset.theme as Mode | undefined) ?? 'night',
  )
  const isDay = mode === 'day'
  const nextLabel = isDay ? '切换到夜间模式' : '切换到日间模式'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setMode(toggleMode())}
      aria-label={nextLabel}
      aria-pressed={isDay}
      title={nextLabel}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {isDay ? '☀' : '☾'}
      </span>
      <span className="theme-toggle-text" aria-hidden="true">
        {isDay ? '日' : '夜'}
      </span>
    </button>
  )
}
