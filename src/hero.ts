/**
 * 首页背景：每次刷新随机换一个主题的上海地图。
 *
 * 只随机「深色系」——白底主题在黑站上会被遮罩压成一片灰，反而更脏。
 * 想加入其它主题：把 web 版图放进 public/backgrounds/，再把名字加进 HERO_POOL 即可。
 */

export const HERO_POOL = ['emerald', 'noir', 'midnight_blue', 'blueprint', 'neon_cyberpunk'] as const

const LAST_KEY = 'iw-hero-last'

/** 随机挑一个，尽量不和上一次相同（同一会话内） */
function pickTheme(): string {
  const pool = HERO_POOL as readonly string[]
  let last = ''
  try {
    last = sessionStorage.getItem(LAST_KEY) ?? ''
  } catch {
    /* 隐私模式：忽略 */
  }

  const candidates = pool.length > 1 ? pool.filter((t) => t !== last) : pool
  const theme = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0]

  try {
    sessionStorage.setItem(LAST_KEY, theme)
  } catch {
    /* ignore */
  }
  return theme
}

/** 在 React 首次渲染前调用，避免闪一下默认背景 */
export function applyRandomHero(): void {
  const theme = pickTheme()
  const root = document.documentElement
  root.style.setProperty('--hero-img', `url("/backgrounds/hero-${theme}-landscape.webp")`)
  root.style.setProperty('--hero-img-portrait', `url("/backgrounds/hero-${theme}-portrait.webp")`)
  root.dataset.hero = theme
}
