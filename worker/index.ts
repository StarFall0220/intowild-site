/**
 * intowild-site Worker
 *
 * 只做一件事：把请求交给静态资源（dist/），顺便补一层安全响应头。
 * 以后要加报名接口、活动 API，都在这里加分支，不要动 dist/。
 *
 * 本地起 Worker 调试：npx wrangler dev
 * 部署：npm run build && npx wrangler deploy
 */

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
