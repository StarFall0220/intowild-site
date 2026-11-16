# intowild-site

intowild户外社 官网（`https://intowild.online`）。**Vite + React + TypeScript** 单页站点，部署在 **Cloudflare Workers（Static Assets）**。

> 注意：这里是 Workers + Static Assets，**不是 Cloudflare Pages**。
> 面板里在 **Workers & Pages → Workers** 标签下找 `intowild-site`，Pages 标签下是空的。

## 本地运行

```bash
npm install     # 第一次，或依赖有变化时
npm run dev     # 本地预览：http://localhost:5173
npm run build   # 生产构建，产物在 dist/
```

也可以双击 `start-dev.cmd`，会自动打开浏览器。改代码保存后页面自动刷新。

## 目录说明

```
index.html                  页面外壳：<title>、meta、canonical 都在这
src/main.tsx                React 挂载入口，一般不用动
src/App.tsx                 ★ 整个首页：文案常量 SITE 在文件顶部，下面是版式
src/components/Todo.tsx     占位标记 <Todo>
src/index.css               全部样式：配色变量在最上面
public/                     原样拷进 dist：favicon、_headers、robots.txt、sitemap.xml、404.html
worker/index.ts             Worker 入口：www 跳主域 + 交给静态资源 + 补安全头
dist/                       构建产物，自动生成，不要手改
```

## 常见修改对照

| 想改什么 | 改哪里 |
| --- | --- |
| 社团名、所属学校/城市、一句话定位 | `src/App.tsx` 顶部的 `SITE` |
| 版式、字号、间距 | `src/index.css` |
| 配色 | `src/index.css` 的 `:root` 变量 |
| 浏览器标签标题、分享卡片 | `index.html` 的 `<title>` / `og:` |
| 404 页 | `public/404.html`（纯静态，不走 React） |

## 占位怎么填

`src/App.tsx` 顶部的 `SITE`：

```ts
org: '上海',
tagline: 'Into the wild, out of the ordinary.',
```

**规则**：值以 `<` 开头就渲染成橙色虚线占位框，填成普通文字就自动变正常文本（逻辑在 `src/App.tsx` 的 `Ph`）。以后加新字段照这个规则写即可。

## 部署流程

```bash
git add -A
git commit -m "描述这次改了什么"
git push
```

推送后由 Cloudflare Workers Builds 自动构建，延迟可能几十分钟。
赶时间就直接手动发布（用的是本地 `dist/`，与 git 提交内容一致）：

```bash
npm run build
npx wrangler deploy
```

查看部署记录：`npx wrangler deployments list --name intowild-site`

## 两个容易踩的点

- **不要**给 `wrangler.jsonc` 加 `html_handling: "none"`：实测它会把「`/` → `index.html`」一起关掉，首页直接 404。默认值就是对的。
- `www.intowild.online` 的 301 在 `worker/index.ts` 里做，**不要**再在 Cloudflare 面板配 Redirect Rule，否则会重复跳转。
