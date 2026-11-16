# intowild-site

intowild 户外社官网（`https://intowild.online`）。**Vite + React + TypeScript** 多页站点，部署在 **Cloudflare Workers（Static Assets）**。

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
index.html / activities.html / gallery.html / about.html / join.html / 404.html
                            每个页面一个 html 外壳，<title>、meta 写在这里
src/main.tsx                首页入口：只负责挂载 App
src/App.tsx                 首页
src/activities.tsx          活动页（含自己的挂载代码）
src/gallery.tsx             图集页
src/about.tsx               关于页
src/join.tsx                加入页
src/notfound.tsx            404 页
src/content.ts              ★ 全站文案与数据都在这里，改内容先看它
src/components/Layout.tsx   页头 + 页脚 + 导航
src/components/PageHead.tsx 内页抬头（编号 + 标题 + 导语）
src/components/Todo.tsx     占位标记 <Todo>，以及自动识别的 <Ph>
src/index.css               全局：配色变量、页头页脚、按钮
src/pages.css               各页面专用样式
public/                     原样拷进 dist：favicon、_headers、robots.txt、照片
worker/index.ts             Worker 入口：把请求交给静态资源 + 补安全头
dist/                       构建产物，自动生成，不要手改
```

## 常见修改对照

| 想改什么 | 改哪里 |
| --- | --- |
| 社团简介、联系方式、活动列表、图集、招新流程、FAQ | `src/content.ts` |
| 首页结构 | `src/App.tsx` |
| 浏览器标签页标题、分享卡片 | 对应页面的 `.html` 里的 `<title>` / `og:` |
| 配色、字号、间距 | `src/index.css` 顶部的 CSS 变量 |
| 某个页面的版式 | `src/pages.css` |
| 新增一个页面 | 新建 `xxx.html` + `src/xxx.tsx`（照抄 `activities.tsx` 的挂载写法）+ 在 `vite.config.ts` 的 `input` 里加一行 + 在 `Layout.tsx` 的 `NAV` 里加一项 |

## 占位怎么填

页面上所有橙色虚线框都是占位，来自 `src/content.ts` 里带尖括号的字符串（如 `<联系邮箱>`）。

- 改 `content.ts` 里的字符串，把 `<...>` 换成真实内容，尖括号删掉；
- 页面会自动从橙色框变成普通文字（`<Ph>` 的判定逻辑在 `src/components/Todo.tsx`）；
- 少量直接写在页面里的占位用 `<Todo>...</Todo>` 包着，改完替换成普通文字即可。

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

## 上线前必须补的

1. `src/content.ts` 里所有 `<...>` 占位
2. `wrangler.jsonc` 里取消注释 `routes`，填真实域名
3. 照片放进 `public/photos/`，在 `content.ts` 的 `photos` 里填 `src`
