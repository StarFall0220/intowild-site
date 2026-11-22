/**
 * intowild-site Worker
 *
 * 四个主机名共用这一个 Worker：
 *   intowild.online             → 主站（dist/index.html）
 *   www.intowild.online         → 301 到主域
 *   activitymap.intowild.online → 活动地图页（dist/activitymap.html）
 *   guestbook.intowild.online   → 留言板页（dist/guestbook.html）+ 留言接口
 *
 * 留言接口在「主域」和「留言子域」都挂了一份：
 *   - 主域是为了表单同源提交，免 CORS/preflight
 *   - 子域是留言板的规范入口（页面 + JSON）
 *
 * 绑定前确认主机名上没有既存的 A/CNAME，否则 deploy 会报 code 100117。
 * 本地起 Worker 调试：npx wrangler dev；部署：npm run build && npx wrangler deploy
 */

/** 主域名。换域名时改这里 + wrangler.jsonc 的 routes + 各 html 的 canonical */
const APEX = 'intowild.online'

/** 活动地图子域名 */
const ACTIVITY_HOST = `activitymap.${APEX}`

/** 留言板子域名 */
const GUESTBOOK_HOST = `guestbook.${APEX}`

/** 子域名根路径实际渲染的静态页面（不带 .html，避免静态资源层再 307 一次） */
const ACTIVITY_PAGE = '/activitymap'
const GUESTBOOK_PAGE = '/guestbook'

const API_PATH = '/api/messages'

/** 一条留言的限制 */
const MAX_BODY = 280
const MAX_NAME = 24
const MAX_CLIENT_ID = 64
const MAX_REQUEST_BYTES = 4096

/** 限流窗口 */
const RATE_PER_MINUTE = 3
const RATE_PER_DAY = 20
const CLIENT_PER_MINUTE = 2
const DEDUPE_WINDOW_MS = 60_000

interface Env {
  ASSETS: Fetcher
  DB: D1Database
  GUESTBOOK_OPEN?: string
  /** 可选：给 IP 哈希加的盐，`wrangler secret put GUESTBOOK_SALT` 设置更稳妥 */
  GUESTBOOK_SALT?: string
}

interface MessageRow {
  id: string
  created_at: number
  body: string
  name: string | null
}

/* ---------------- 工具 ---------------- */

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extra,
    },
  })

/** 按码点计数，emoji 算 1 个 */
const charCount = (s: string) => Array.from(s).length

/** 正文规范化：去控制字符、保留换行、压掉多余空行 */
function normalizeBody(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function normalizeName(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME)
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** IP 只存哈希：风控用，不外露；日期参与哈希，等于每天换一次盐 */
async function hashIp(request: Request, env: Env): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const salt = env.GUESTBOOK_SALT ?? 'intowild-guestbook-v1'
  const day = new Date().toISOString().slice(0, 10)
  return sha256Hex(`${ip}|${salt}|${day}`)
}

/* ---------------- 留言接口 ---------------- */

async function listMessages(url: URL, env: Env): Promise<Response> {
  const limitRaw = Number(url.searchParams.get('limit') ?? '30')
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50) : 30

  // 游标是 "created_at_id"，用元组比较避免同一毫秒内重复/漏条
  const cursor = url.searchParams.get('before') ?? ''
  const sep = cursor.lastIndexOf('_')
  const cAt = sep > 0 ? Number(cursor.slice(0, sep)) : NaN
  const cId = sep > 0 ? cursor.slice(sep + 1) : ''

  const stmt =
    Number.isFinite(cAt) && cId
      ? env.DB.prepare(
          `SELECT id, created_at, body, name FROM messages
           WHERE status = 'ok' AND (created_at < ?1 OR (created_at = ?1 AND id < ?2))
           ORDER BY created_at DESC, id DESC LIMIT ?3`,
        ).bind(cAt, cId, limit)
      : env.DB.prepare(
          `SELECT id, created_at, body, name FROM messages
           WHERE status = 'ok'
           ORDER BY created_at DESC, id DESC LIMIT ?1`,
        ).bind(limit)

  const { results } = await stmt.all<MessageRow>()
  const items = results ?? []
  const last = items[items.length - 1]
  return json({
    ok: true,
    items: items.map((r) => ({
      id: r.id,
      body: r.body,
      name: r.name ?? '',
      createdAt: r.created_at,
    })),
    nextCursor: items.length === limit && last ? `${last.created_at}_${last.id}` : null,
  })
}

async function createMessage(request: Request, env: Env): Promise<Response> {
  if (env.GUESTBOOK_OPEN !== 'true') {
    return json({ ok: false, error: 'GUESTBOOK_CLOSED' }, 503)
  }

  const len = Number(request.headers.get('content-length') ?? '0')
  if (len > MAX_REQUEST_BYTES) return json({ ok: false, error: 'TOO_LARGE' }, 400)

  let payload: { body?: unknown; name?: unknown; clientId?: unknown }
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'BAD_JSON' }, 400)
  }

  if (typeof payload.body !== 'string') return json({ ok: false, error: 'EMPTY' }, 400)
  const body = normalizeBody(payload.body)
  const name = normalizeName(payload.name)
  const clientId =
    typeof payload.clientId === 'string'
      ? payload.clientId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, MAX_CLIENT_ID)
      : ''

  if (!body) return json({ ok: false, error: 'EMPTY' }, 400)
  if (charCount(body) > MAX_BODY) return json({ ok: false, error: 'TOO_LONG' }, 400)
  if (charCount(name) > MAX_NAME) return json({ ok: false, error: 'BAD_NAME' }, 400)

  const now = Date.now()
  const ipHash = await hashIp(request, env)

  // 60 秒内同客户端同内容 → 幂等返回，不新增
  if (clientId) {
    const dup = await env.DB.prepare(
      `SELECT id FROM messages WHERE client_id = ?1 AND body = ?2 AND created_at > ?3 LIMIT 1`,
    )
      .bind(clientId, body, now - DEDUPE_WINDOW_MS)
      .first<{ id: string }>()
    if (dup) return json({ ok: true, duplicate: true, id: dup.id })
  }

  // 限流：IP 每分钟/每天，客户端每分钟
  const minuteAgo = now - 60_000
  const dayAgo = now - 86_400_000
  const ipMinute = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ?1 AND created_at > ?2`,
  )
    .bind(ipHash, minuteAgo)
    .first<{ n: number }>()
  if ((ipMinute?.n ?? 0) >= RATE_PER_MINUTE) {
    return json({ ok: false, error: 'RATE_LIMITED', retryAfter: 30 }, 429, { 'retry-after': '30' })
  }
  const ipDay = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM messages WHERE ip_hash = ?1 AND created_at > ?2`,
  )
    .bind(ipHash, dayAgo)
    .first<{ n: number }>()
  if ((ipDay?.n ?? 0) >= RATE_PER_DAY) {
    return json({ ok: false, error: 'RATE_LIMITED', retryAfter: 3600 }, 429, { 'retry-after': '3600' })
  }
  if (clientId) {
    const clientMinute = await env.DB.prepare(
      `SELECT COUNT(*) AS n FROM messages WHERE client_id = ?1 AND created_at > ?2`,
    )
      .bind(clientId, minuteAgo)
      .first<{ n: number }>()
    if ((clientMinute?.n ?? 0) >= CLIENT_PER_MINUTE) {
      return json({ ok: false, error: 'RATE_LIMITED', retryAfter: 30 }, 429, { 'retry-after': '30' })
    }
  }

  const id = crypto.randomUUID()
  await env.DB.prepare(
    `INSERT INTO messages (id, created_at, body, name, client_id, ip_hash, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'ok')`,
  )
    .bind(id, now, body, name || null, clientId || null, ipHash)
    .run()

  const total = await env.DB.prepare(`SELECT COUNT(*) AS n FROM messages WHERE status = 'ok'`).first<{
    n: number
  }>()

  return json({ ok: true, id, createdAt: now, total: total?.n ?? 0 }, 201)
}

async function handleMessagesApi(request: Request, env: Env): Promise<Response> {
  if (request.method === 'GET') return listMessages(new URL(request.url), env)
  if (request.method === 'POST') return createMessage(request, env)
  return json({ ok: false, error: 'METHOD_NOT_ALLOWED' }, 405, { allow: 'GET, POST' })
}

/* ---------------- 入口 ---------------- */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // www 跳主域，保留路径和查询参数
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX
      return Response.redirect(url.toString(), 301)
    }

    // 留言接口：主域（表单同源）与留言子域共用同一套实现
    if (url.pathname === API_PATH && (url.hostname === APEX || url.hostname === GUESTBOOK_HOST)) {
      return handleMessagesApi(request, env)
    }

    // 子域名根路径 → 对应静态页；其余路径仍按静态资源走（css/js 才能正常加载）
    if (url.hostname === ACTIVITY_HOST && (url.pathname === '/' || url.pathname === '')) {
      const inner = new URL(request.url)
      inner.pathname = ACTIVITY_PAGE
      return env.ASSETS.fetch(new Request(inner.toString(), request))
    }
    if (url.hostname === GUESTBOOK_HOST && (url.pathname === '/' || url.pathname === '')) {
      const inner = new URL(request.url)
      inner.pathname = GUESTBOOK_PAGE
      return env.ASSETS.fetch(new Request(inner.toString(), request))
    }

    const res = await env.ASSETS.fetch(request)

    // 静态头（public/_headers）之外的兜底项，覆盖所有响应
    const headers = new Headers(res.headers)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    })
  },
} satisfies ExportedHandler<Env>
