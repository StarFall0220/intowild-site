import { useCallback, useEffect, useState } from 'react'
import {
  clearAdminToken,
  deleteMessage,
  formatTime,
  getAdminToken,
  listMessages,
  setAdminToken,
  verifyAdmin,
  type Message,
} from './api'

export function GuestbookList() {
  const [items, setItems] = useState<Message[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 管理员模式：密钥存在 localStorage，刷新后仍然有效
  const [token, setToken] = useState('')
  const [asking, setAsking] = useState(false)
  const [input, setInput] = useState('')
  const [authError, setAuthError] = useState('')

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
    setToken(getAdminToken())
  }, [load])

  async function enterAdmin() {
    const t = input.trim()
    if (!t) return
    if (await verifyAdmin(t)) {
      setAdminToken(t)
      setToken(t)
      setAsking(false)
      setInput('')
      setAuthError('')
    } else {
      setAuthError('密钥不对')
    }
  }

  function exitAdmin() {
    clearAdminToken()
    setToken('')
  }

  async function remove(id: string) {
    if (!window.confirm('删除这条留言？删了就没了。')) return
    const r = await deleteMessage(id, token)
    if (r === 'ok') {
      setItems((prev) => prev.filter((m) => m.id !== id))
    } else if (r === 'unauthorized') {
      exitAdmin()
      setAuthError('密钥失效了，重新进')
    } else if (r === 'notfound') {
      setItems((prev) => prev.filter((m) => m.id !== id))
    } else {
      setError('删除失败，稍后重试')
    }
  }

  const isAdmin = !!token

  return (
    <main className="gb-page">
      <header className="gb-page-bar">
        <a className="gb-back" href="https://intowild.online">
          ← intowild.online
        </a>
        <div className="gb-bar-right">
          <span className="gb-tag">GUESTBOOK</span>
          <button
            type="button"
            className={isAdmin ? 'gb-admin is-on' : 'gb-admin'}
            onClick={() => (isAdmin ? exitAdmin() : (setAsking((v) => !v), setAuthError('')))}
          >
            {isAdmin ? '退出管理' : '管理'}
          </button>
        </div>
      </header>

      {asking && !isAdmin && (
        <div className="gb-auth">
          <label className="gb-sr" htmlFor="gb-token">
            管理员密钥
          </label>
          <input
            id="gb-token"
            className="gb-auth-input"
            type="password"
            placeholder="管理员密钥"
            value={input}
            autoFocus
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void enterAdmin()
              if (e.key === 'Escape') setAsking(false)
            }}
          />
          <button type="button" className="gb-auth-btn" onClick={() => void enterAdmin()}>
            进入
          </button>
          {authError && <span className="gb-auth-err">{authError}</span>}
        </div>
      )}

      <div className="gb-page-head">
        <h1 className="gb-title">留言板</h1>
        <p className="gb-sub">谁都能写，不用登录。一条是一条，按时间倒序。</p>
      </div>

      <section className="gb-list" aria-live="polite">
        {loading && items.length === 0 && <p className="gb-empty">加载中…</p>}
        {!loading && items.length === 0 && !error && <p className="gb-empty">还没有人留言，来做第一个。</p>}
        {error && <p className="gb-empty">{error}</p>}

        {items.map((m) => (
          <article className="gb-item" key={m.id}>
            <header className="gb-item-head">
              <span className="gb-item-name">{m.name || '匿名'}</span>
              <span className="gb-item-meta">
                <time className="gb-item-time" dateTime={new Date(m.createdAt).toISOString()}>
                  {formatTime(m.createdAt)}
                </time>
                {isAdmin && (
                  <button
                    type="button"
                    className="gb-item-del"
                    onClick={() => void remove(m.id)}
                    aria-label={`删除这条留言：${m.body.slice(0, 12)}`}
                    title="删除"
                  >
                    ×
                  </button>
                )}
              </span>
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
