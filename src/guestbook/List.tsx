import { useCallback, useEffect, useState } from 'react'
import { formatTime, listMessages, type Message } from './api'

export function GuestbookList() {
  const [items, setItems] = useState<Message[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (before?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await listMessages(before)
      setItems((prev) => (before ? [...prev, ...res.items] : res.items))
      setCursor(res.nextCursor)
    } catch {
      setError('没加载出来，稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="gb-page">
      <header className="gb-page-bar">
        <a className="gb-back" href="https://intowild.online">
          ← intowild.online
        </a>
        <span className="gb-tag">GUESTBOOK</span>
      </header>

      <div className="gb-page-head">
        <h1 className="gb-title">留言板</h1>
        <p className="gb-sub">
          谁都能写，不用登录。一条是一条，按时间倒序。
        </p>
      </div>

      <section className="gb-list" aria-live="polite">
        {loading && items.length === 0 && <p className="gb-empty">加载中…</p>}
        {!loading && items.length === 0 && !error && <p className="gb-empty">还没有人留言，来做第一个。</p>}
        {error && <p className="gb-empty">{error}</p>}

        {items.map((m) => (
          <article className="gb-item" key={m.id}>
            <header className="gb-item-head">
              <span className="gb-item-name">{m.name || '匿名'}</span>
              <time className="gb-item-time" dateTime={new Date(m.createdAt).toISOString()}>
                {formatTime(m.createdAt)}
              </time>
            </header>
            <p className="gb-item-body">{m.body}</p>
          </article>
        ))}
      </section>

      <div className="gb-more">
        {cursor && (
          <button type="button" className="gb-more-btn" onClick={() => void load(cursor)} disabled={loading}>
            {loading ? '加载中…' : '加载更多'}
          </button>
        )}
        {!cursor && items.length > 0 && <p className="gb-end">到底了</p>}
      </div>

      <footer className="gb-page-foot">
        <span>Into Wild 户外社</span>
        <a href="https://intowild.online">回主站 ↗</a>
      </footer>
    </main>
  )
}
