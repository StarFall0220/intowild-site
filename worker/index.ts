/**
 * intowild-site Worker
 *
 * 三个主机名共用这一个 Worker：
 *   intowild.online            → 主站（dist/index.html）
 *   www.intowild.online        → 301 到主域
 *   activitymap.intowild.online→ 活动地图页（dist/activitymap.html）
 *
 * 绑定前确认主机名上没有既存的 A/CNAME，否则 deploy 会报 code 100117。
 * 本地起 Worker 调试：npx wrangler dev；部署：npm run build && npx wrangler deploy
 */

/** 主域名。换域名时改这里 + wrangler.jsonc 的 routes + 各 html 的 canonical */
const APEX = 'intowild.online'

/** 活动地图子域名 */
const ACTIVITY_HOST = `activitymap.${APEX}`

/** 子域名根路径实际渲染的静态页面（不带 .html，避免静态资源层再 307 一次） */
const ACTIVITY_PAGE = '/activitymap'

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // www 跳主域，保留路径和查询参数
    if (url.hostname === `www.${APEX}`) {
      url.hostname = APEX
      return Response.redirect(url.toString(), 301)
    }

    // 子域名根路径 → 地图页；其余路径仍按静态资源走（css/js 才能正常加载）
    if (url.hostname === ACTIVITY_HOST && (url.pathname === '/' || url.pathname === '')) {
      const inner = new URL(request.url)
      inner.pathname = ACTIVITY_PAGE
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
