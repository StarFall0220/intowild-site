/**
 * 日间 / 夜间模式 + 首页背景主题。
 *
 * 规则（按用户定）：
 *   - 默认看现实时间：07:00–18:00 日间，其余夜间
 *   - 手动点按钮则覆盖，并记进 localStorage，下次仍按手动值
 *
 * 背景：夜间用深色系主题，日间用浅色系主题，各自随机、各自避免连续重复。
 * 一切在 createRoot 之前执行，避免首帧闪默认配色。
 */

export type Mode = 'day' | 'night'

/** 夜间：深色系，压暗后做纹理（17 个主题里的全部深色款） */
export const HERO_POOL_DARK = ['emerald', 'noir', 'midnight_blue', 'blueprint', 'neon_cyberpunk'] as const

/** 日间：浅色系，黑字压在上面（其余 12 个主题全在这） */
export const HERO_POOL_LIGHT = [
  'warm_beige',
  'pastel_dream',
  'autumn',
  'terracotta',
  'sunset',
  'contrast_zones',
  'copper_patina',
  'forest',
  'gradient_roads',
  'japanese_ink',
  'monochrome_blue',
  'ocean',
] as const

const MODE_KEY = 'iw-theme'
const DAY_START = 7
const DAY_END = 18

/** 是否在日间时段（本地时间） */
export function isDaytime(now = new Date()): boolean {
  const h = now.getHours()
  return h >= DAY_START && h < DAY_END
}

function readStoredMode(): Mode | null {
  try {
    const v = localStorage.getItem(MODE_KEY)
    return v === 'day' || v === 'night' ? v : null
  } catch {
    return null
  }
}

/** 当前模式：手动覆盖优先，否则按时间 */
export function resolveMode(now = new Date()): Mode {
  return readStoredMode() ?? (isDaytime(now) ? 'day' : 'night')
}

/** 在某个池里随机挑，尽量不和本会话上一次相同 */
function pickTheme(pool: readonly string[], key: string): string {
  let last = ''
  try {
    last = sessionStorage.getItem(key) ?? ''
  } catch {
    /* 隐私模式：忽略 */
  }
  const candidates = pool.length > 1 ? pool.filter((t) => t !== last) : pool
  const theme = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0]
  try {
    sessionStorage.setItem(key, theme)
  } catch {
    /* ignore */
  }
  return theme
}

/** 只换背景，不动模式 */
export function applyHero(mode: Mode): string {
  const pool = mode === 'day' ? HERO_POOL_LIGHT : HERO_POOL_DARK
  const theme = pickTheme(pool, `iw-hero-last-${mode}`)
  const root = document.documentElement
  root.style.setProperty('--hero-img', `url("/backgrounds/hero-${theme}-landscape.webp")`)
  root.style.setProperty('--hero-img-portrait', `url("/backgrounds/hero-${theme}-portrait.webp")`)
  root.dataset.hero = theme
  return theme
}

/** 应用模式（含背景），返回最终生效的模式 */
export function applyMode(mode: Mode): Mode {
  document.documentElement.dataset.theme = mode
  applyHero(mode)
  return mode
}

/** 手动切换并记住 */
export function toggleMode(): Mode {
  const next: Mode = document.documentElement.dataset.theme === 'day' ? 'night' : 'day'
  try {
    localStorage.setItem(MODE_KEY, next)
  } catch {
    /* ignore */
  }
  return applyMode(next)
}

/** 首次渲染前调用 */
export function initTheme(): Mode {
  return applyMode(resolveMode())
}
