import { useCallback, useEffect, useRef, useState } from 'react'
import { MAP, MARKERS } from './map-markers'

const MIN_SCALE = 1
const MAX_SCALE = 6

interface View {
  x: number
  y: number
  s: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function ActivityMap() {
  const stageRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 1 })
  const [active, setActive] = useState<string | null>(null)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)
  const pinch = useRef<{ d: number; s: number; x: number; y: number; cx: number; cy: number } | null>(null)
  const moved = useRef(0)
  /** 拖拽结束后紧跟的那一次 click 要吞掉，避免拖完误触发星标 */
  const suppressClick = useRef(false)
  /** 这次按下落在哪个星标上（指针捕获后 click 会落到舞台，需自己判定） */
  const pressId = useRef<string | null>(null)

  // 量的是外层可用区域，画布按地图比例收缩，避免上下大片黑边
  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setBox({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const fit = box.w && box.h ? Math.min(box.w / MAP.width, box.h / MAP.height) : 0
  const cw = MAP.width * fit
  const ch = MAP.height * fit

  const clampView = useCallback(
    (v: View): View => {
      const s = clamp(v.s, MIN_SCALE, MAX_SCALE)
      const maxX = Math.max(0, (cw * s - box.w) / 2)
      const maxY = Math.max(0, (ch * s - box.h) / 2)
      return { s, x: clamp(v.x, -maxX, maxX), y: clamp(v.y, -maxY, maxY) }
    },
    [box.w, box.h, cw, ch],
  )

  // 以某个屏幕点为中心缩放
  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      const el = stageRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = clientX - r.left - r.width / 2
      const py = clientY - r.top - r.height / 2
      setView((v) => {
        const s2 = clamp(v.s * factor, MIN_SCALE, MAX_SCALE)
        const k = s2 / v.s
        return clampView({ s: s2, x: px - (px - v.x) * k, y: py - (py - v.y) * k })
      })
    },
    [clampView],
  )

  const reset = useCallback(() => setView({ x: 0, y: 0, s: 1 }), [])

  // 滚轮缩放：必须用非 passive 监听，否则无法阻止页面滚动
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0016))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  // ESC 关闭图片
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  const onPointerDown = (e: React.PointerEvent) => {
    const el = stageRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    moved.current = 0
    suppressClick.current = false
    pressId.current = (e.target as HTMLElement).closest('[data-marker]')?.getAttribute('data-marker') ?? null

    if (pointers.current.size === 1) {
      drag.current = { px: e.clientX, py: e.clientY, x: view.x, y: view.y }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = {
        d: Math.hypot(a.x - b.x, a.y - b.y),
        s: view.s,
        x: view.x,
        y: view.y,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      }
      drag.current = null
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 1 && drag.current) {
      const d = drag.current
      const dx = e.clientX - d.px
      const dy = e.clientY - d.py
      moved.current = Math.max(moved.current, Math.hypot(dx, dy))
      setView((v) => clampView({ s: v.s, x: d.x + dx, y: d.y + dy }))
    } else if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const p = pinch.current
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const s2 = clamp(p.s * (dist / p.d), MIN_SCALE, MAX_SCALE)
      const k = s2 / p.s
      const el = stageRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const px = p.cx - r.left - r.width / 2
      const py = p.cy - r.top - r.height / 2
      moved.current = 99
      setView(clampView({ s: s2, x: px - (px - p.x) * k, y: py - (py - p.y) * k }))
    }
  }

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 0) {
      drag.current = null
      if (moved.current > 6) suppressClick.current = true
      // 指针捕获会让 click 落到舞台上，这里按「按下的目标 + 没怎么移动」判定点星标
      if (moved.current <= 6 && pressId.current) {
        setActive(pressId.current)
      }
      pressId.current = null
    }
  }

  const openPhoto = (id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    setActive(id)
  }

  const inv = 1 / view.s

  return (
    <main className="map-page">
      <header className="map-bar">
        <a className="map-back" href="https://intowild.online">
          ← intowild.online
        </a>
        <span className="map-tag">ACTIVITY MAP</span>
      </header>

      <div className="map-head">
        <h1 className="map-title">活动地图</h1>
        <p className="map-lead">滚轮或双指缩放，拖动查看；点星标看照片。</p>
      </div>

      <div className="map-stage" ref={areaRef}>
        <div
          className="map-canvas"
          ref={stageRef}
          style={{ width: cw || '100%', height: ch || '100%' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          role="application"
          aria-label="植物园藏宝图，可缩放拖动"
        >
        <div
          className="map-content"
          data-zoomed={view.s >= 2.2 ? 'true' : 'false'}
          style={{
            width: cw || 1,
            height: ch || 1,
            transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.s})`,
          }}
        >
          <img className="map-img" src="/map/botanical-map.jpg" alt="上海植物园藏宝图" draggable={false} />

          {MARKERS.map((m) => (
            <button
              key={m.id}
              className="marker"
              data-marker={m.id}
              style={{ left: `${m.x}%`, top: `${m.y}%`, ['--inv' as string]: inv }}
              onClick={() => openPhoto(m.id)}
              aria-label={`查看地点 ${m.id} 的照片`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1.6l3.1 6.9 7.3.7-5.5 4.9 1.6 7.2L12 17.5 5.5 21.3l1.6-7.2L1.6 9.2l7.3-.7z" />
              </svg>
              <span className="marker-label">{m.id}</span>
            </button>
          ))}
        </div>

        <div className="map-controls">
          <button
            type="button"
            onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1 / 1.4)}
            aria-label="缩小"
          >
            −
          </button>
          <span className="map-scale" aria-live="polite">
            {view.s.toFixed(1)}×
          </span>
          <button
            type="button"
            onClick={() => zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.4)}
            aria-label="放大"
          >
            +
          </button>
          <button type="button" onClick={reset} aria-label="复位">
            ⟲
          </button>
        </div>
        </div>
      </div>

      {active && (
        <div
          className="lightbox"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`地点 ${active} 的照片`}
        >
          <figure className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={`/photos/${active}.jpg`} alt={`地点 ${active}`} />
            <figcaption>
              <span className="lightbox-id">{active}</span>
              <button type="button" className="lightbox-close" onClick={() => setActive(null)} aria-label="关闭">
                ✕
              </button>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  )
}
