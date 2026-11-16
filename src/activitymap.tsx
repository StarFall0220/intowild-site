import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MAP, MARKERS } from './map-markers'

const MIN_SCALE = 1
const MAX_SCALE = 6

/** 缩略图尺寸与相对星标的间距（px，屏幕坐标，不随地图缩放） */
const THUMB_W = 148
const THUMB_H = 104
const THUMB_GAP = 14
const STAR_HALF = 10
const EDGE = 8

interface View {
  x: number
  y: number
  s: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function ActivityMap() {
  const stageRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const panelCloseRef = useRef<HTMLButtonElement>(null)

  const [box, setBox] = useState({ w: 0, h: 0 })
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 1 })
  /** 当前显示缩略图的星标 */
  const [active, setActive] = useState<string | null>(null)
  /** 当前在侧栏里显示的星标 */
  const [panel, setPanel] = useState<string | null>(null)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null)
  const pinch = useRef<{ d: number; s: number; x: number; y: number; cx: number; cy: number } | null>(null)
  const moved = useRef(0)
  /** 拖拽结束后紧跟的那一次 click 要吞掉，避免拖完误触发星标 */
  const suppressClick = useRef(false)
  /** 这次按下落在哪个星标上（指针捕获后 click 会落到舞台，需自己判定） */
  const pressId = useRef<string | null>(null)
  /** 这次按下是否落在缩略图上 */
  const pressThumb = useRef(false)

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

  const openPanel = useCallback((id: string) => {
    setActive(id)
    setPanel(id)
  }, [])

  const closePanel = useCallback(() => {
    setPanel(null)
    setActive(null)
  }, [])

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

  // 键盘：Esc 关侧栏（没有侧栏就收起缩略图）
  useEffect(() => {
    if (!panel && !active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (panel) closePanel()
      else setActive(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel, active, closePanel])

  // 打开侧栏后把焦点移到关闭按钮；关闭后焦点回到对应星标
  useEffect(() => {
    if (panel) {
      panelCloseRef.current?.focus()
    } else if (active === null) {
      const last = stageRef.current?.getAttribute('data-last-marker')
      if (last) document.querySelector<HTMLButtonElement>(`[data-marker="${last}"]`)?.focus()
    }
  }, [panel, active])

  const onPointerDown = (e: React.PointerEvent) => {
    const el = stageRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    moved.current = 0
    suppressClick.current = false
    pressId.current = (e.target as HTMLElement).closest('[data-marker]')?.getAttribute('data-marker') ?? null
    pressThumb.current = !!(e.target as HTMLElement).closest('.thumb')
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

      if (moved.current <= 6) {
        const id = pressId.current
        if (pressThumb.current && active) {
          // 点缩略图 = 第二步
          openPanel(active)
        } else if (id) {
          stageRef.current?.setAttribute('data-last-marker', id)
          // 第一次点：出缩略图；再点同一处：开侧栏
          if (active === id) openPanel(id)
          else setActive(id)
        } else if (active && !panel) {
          // 点空白收起缩略图
          setActive(null)
        }
      }
      pressId.current = null
      pressThumb.current = false
    }
  }

  const inv = 1 / view.s
  const panelId = panel
  const activeMarker = useMemo(() => MARKERS.find((m) => m.id === active) ?? null, [active])

  // 缩略图位置：把星标换算到画布坐标，默认在上方，贴顶就翻到下方，并夹在画布内
  const thumb = useMemo(() => {
    if (!activeMarker || !cw || !ch) return null
    // 画布很矮时按比例缩小缩略图，保证「不压星标」还有解
    const tw = Math.min(THUMB_W, Math.max(96, Math.round(cw * 0.42)))
    const th = Math.min(THUMB_H, Math.max(64, Math.round(ch * 0.34)))

    const x = cw / 2 + view.x + (activeMarker.x / 100 - 0.5) * cw * view.s
    const y = ch / 2 + view.y + (activeMarker.y / 100 - 0.5) * ch * view.s

    const fits = (top: number) => top >= EDGE && top + th <= ch - EDGE
    let top = y - STAR_HALF - THUMB_GAP - th
    if (!fits(top)) top = y + STAR_HALF + THUMB_GAP
    if (!fits(top)) top = clamp(top, EDGE, Math.max(EDGE, ch - th - EDGE))

    const left = clamp(x - tw / 2, EDGE, Math.max(EDGE, cw - tw - EDGE))
    return { left, top, w: tw, h: th }
  }, [activeMarker, cw, ch, view])

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
                className={m.id === active ? 'marker is-active' : 'marker'}
                data-marker={m.id}
                style={{ left: `${m.x}%`, top: `${m.y}%`, ['--inv' as string]: inv }}
                onClick={() => {
                  if (suppressClick.current) {
                    suppressClick.current = false
                    return
                  }
                  if (active === m.id) openPanel(m.id)
                  else setActive(m.id)
                }}
                aria-label={`地点 ${m.id}，查看缩略图`}
                aria-expanded={active === m.id}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 1.6l3.1 6.9 7.3.7-5.5 4.9 1.6 7.2L12 17.5 5.5 21.3l1.6-7.2L1.6 9.2l7.3-.7z" />
                </svg>
                <span className="marker-label">{m.id}</span>
              </button>
            ))}
          </div>

          {thumb && active && (
            <button
              className="thumb"
              style={{ left: thumb.left, top: thumb.top, width: thumb.w, height: thumb.h }}
              onClick={(e) => {
                e.stopPropagation()
                openPanel(active)
              }}
              aria-label={`地点 ${active}，查看大图`}
            >
              <img src={`/photos/thumbs/${active}.jpg`} alt={`地点 ${active} 缩略图`} draggable={false} />
              <span className="thumb-id">{active}</span>
            </button>
          )}
        </div>
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

      <div
        className={panelId ? 'panel-backdrop is-open' : 'panel-backdrop'}
        onClick={closePanel}
        aria-hidden="true"
      />

      <aside
        className={panelId ? 'panel is-open' : 'panel'}
        role="dialog"
        aria-modal={panelId ? 'true' : undefined}
        aria-label={panelId ? `地点 ${panelId} 的大图` : '大图侧栏'}
        aria-hidden={panelId ? undefined : 'true'}
      >
        <div className="panel-head">
          <span className="panel-id">{panelId ?? ''}</span>
          <button ref={panelCloseRef} type="button" className="panel-close" onClick={closePanel} aria-label="关闭大图">
            ✕
          </button>
        </div>
        <div className="panel-body">{panelId && <img src={`/photos/${panelId}.jpg`} alt={`地点 ${panelId}`} />}</div>
      </aside>
    </main>
  )
}
