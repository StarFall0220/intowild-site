/** 留言板前端与接口的共用逻辑（主站表单 + 子域留言页都用它） */

export interface Message {
  id: string
  body: string
  name: string
  createdAt: number
}

export interface ListResult {
  ok: boolean
  items: Message[]
  nextCursor: string | null
}

export type CreateError = 'EMPTY' | 'TOO_LONG' | 'RATE_LIMITED' | 'GUESTBOOK_CLOSED' | 'NETWORK' | 'UNKNOWN'

export interface CreateResult {
  ok: boolean
  id?: string
  total?: number
  duplicate?: boolean
  error?: CreateError
  retryAfter?: number
}

export const MAX_BODY = 280
export const MAX_NAME = 24

/** 按码点计数，emoji 算 1 个（和 Worker 端一致） */
export const charCount = (s: string) => Array.from(s).length

const CID_KEY = 'iw-guestbook-cid'

/** 浏览器本地随机 ID：用于服务端去重与限流，不涉及身份 */
export function getClientId(): string {
  try {
    let id = localStorage.getItem(CID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(CID_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

export async function listMessages(before?: string): Promise<ListResult> {
  const qs = new URLSearchParams({ limit: '20' })
  if (before) qs.set('before', before)
  const res = await fetch(`/api/messages?${qs}`, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as ListResult
}

export async function createMessage(body: string, name: string): Promise<CreateResult> {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ body, name, clientId: getClientId() }),
    })
    const data = (await res.json().catch(() => ({}))) as CreateResult
    if (res.ok) return { ...data, ok: true }
    return { ok: false, error: (data.error as CreateError) ?? 'UNKNOWN', retryAfter: data.retryAfter }
  } catch {
    return { ok: false, error: 'NETWORK' }
  }
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const errorText = (e: CreateError | undefined): string => {
  switch (e) {
    case 'EMPTY':
      return '写点什么再发吧'
    case 'TOO_LONG':
      return `最多 ${MAX_BODY} 字`
    case 'RATE_LIMITED':
      return '发得太快了，歇一分钟再来'
    case 'GUESTBOOK_CLOSED':
      return '留言暂时关闭'
    case 'NETWORK':
      return '网络不太行，稍后重试'
    default:
      return '没发出去，稍后再试'
  }
}

/* ---------------- 管理员（删除留言） ---------------- */

const ADMIN_KEY = 'iw-gb-admin'

export function getAdminToken(): string {
  try {
    return localStorage.getItem(ADMIN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_KEY, token)
  } catch {
    /* 隐私模式下写不了，本次会话仍可用 */
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    /* ignore */
  }
}

/** 校验密钥，避免输错了才在删除时才发现 */
export async function verifyAdmin(token: string): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/verify', {
      headers: { authorization: `Bearer ${token}` },
    })
    return res.ok
  } catch {
    return false
  }
}

export type DeleteResult = 'ok' | 'unauthorized' | 'notfound' | 'failed'

export async function deleteMessage(id: string, token: string): Promise<DeleteResult> {
  try {
    const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    })
    if (res.ok) return 'ok'
    if (res.status === 401) return 'unauthorized'
    if (res.status === 404) return 'notfound'
    return 'failed'
  } catch {
    return 'failed'
  }
}
