# intowild 户外社 站点交接文档

**现状**：本地可运行、可构建，**尚未上线**。这是一个 Vite + React（TypeScript）的多页站点，源码准备放在 GitHub，Cloudflare 监听仓库、自动构建并部署，推送后 1–2 分钟生效（实测也可能延迟几十分钟）。日常只需要改源码、提交、推送。

> 本文记录的是这个站点从本地到上线的搭建与维护方式。动手前先执行 `ls` 和 `git log --oneline -5` 核对工作区，以文件系统里的实际内容为准。

## 1. 基本情况

| 项 | 值 |
| --- | --- |
| 域名 | `<待定>`（买好后填这里） |
| 技术栈 | Vite + React（TypeScript） |
| 托管 | Cloudflare Workers（Static Assets） |
| 项目名 | `intowild-site` |
| 本地路径 | `C:\Users\tong7\Documents\intowild-site` |
| 代码仓库 | `<待创建>`，分支 `main` |
| 线上地址 | `<待定>`（`www.<域名>` 301 跳主域名） |

部署参数：构建命令 `npm run build`，部署命令 `npx wrangler deploy`，静态产物目录 `./dist`（由 `wrangler.jsonc` 的 `assets.directory` 指定）。

Node 装在 `C:\node`（v24.22.1），PATH 里可能没有，所以 `start-dev.cmd` 里写死了 `set "PATH=C:\node;%PATH%"`。

## 2. 页面构成

| 页面 | 文件 | 内容 |
| --- | --- | --- |
| 首页 | `index.html` / `src/App.tsx` | 社团名 + 一句话定位、下一次出发的路线卡、三个入口卡、关于摘要 |
| 活动 | `activities.html` | 本学期活动列表（日期/名称/地点/强度/状态）、活动须知三条 |
| 图集 | `gallery.html` | 6 格照片墙，按地点和时间归档 |
| 关于 | `about.html` | 我们是谁 / 我们做什么 / 谁在组织 / 怎么联系 |
| 加入 | `join.html` | 三步加入、报名表入口、常见问题 |
| 404 | `404.html` | 走错路时的兜底页 |

每个页面在 `vite.config.ts` 的 `build.rollupOptions.input` 里登记，新增页面必须同时登记，否则不会被构建。

## 3. 改什么文件

| 想改什么 | 改哪个文件 |
| --- | --- |
| 社团简介、联系方式、活动列表、图集、招新流程、FAQ | `src/content.ts` |
| 首页结构 | `src/App.tsx` |
| 配色、字号、间距、响应式 | `src/index.css`、`src/pages.css` |
| 浏览器标签标题与 meta | 对应页面的 `.html` |
| 图片等静态资源 | `public/`（照片放 `public/photos/`） |
| 安全头与缓存策略 | `public/_headers` |
| 站点名、导航项 | `src/components/Layout.tsx` |

`dist/` 是构建产物，不要手改。

## 4. 日常改动流程

1. 双击 **`start-dev.cmd`**，浏览器打开 `http://localhost:5173`；也可以手动：

   ```bash
   cd "C:\Users\tong7\Documents\intowild-site"
   npm run dev
   ```

2. 按上表修改文件，保存后浏览器自动刷新，确认效果。

3. 可选：先本地构建一次，确认没有类型错误或构建错误：

   ```bash
   cd "C:\Users\tong7\Documents\intowild-site"
   npm run build
   ```

4. 提交并推送：

   ```bash
   cd "C:\Users\tong7\Documents\intowild-site"
   git add -A
   git commit -m "content: 更新 11 月活动"
   git push
   ```

5. 等自动构建，1–2 分钟。进度看 **Cloudflare → Workers & Pages → Workers → `intowild-site` → Deployments**。

6. 打开线上地址，按 `Ctrl + Shift + R` 强刷，确认新内容已经上线。也可以直接用命令确认：

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://<你的域名>/
   ```

## 5. 首次上线步骤

### 5.1 建仓库并推送

GitHub 新建仓库 `intowild-site`（Public），然后：

```bash
cd "C:\Users\tong7\Documents\intowild-site"
git remote add origin git@github.com:<你的用户名>/intowild-site.git
git push -u origin main
```

### 5.2 先手动部署一次，确认产物没问题

```bash
cd "C:\Users\tong7\Documents\intowild-site"
npx wrangler login      # 只做一次，浏览器里点授权
npm run build
npx wrangler deploy
```

成功后终端会给出 `https://intowild-site.<你的账号>.workers.dev`，先在这个地址验收。
`wrangler.jsonc` 里 `workers_dev: true`，所以每次部署都会更新这个测试地址。

### 5.3 接 GitHub 自动构建

Cloudflare 面板 → Workers & Pages → `intowild-site` → **Settings → Build** → 连接 GitHub 仓库。

| 配置项 | 值 |
| --- | --- |
| Git 仓库 | `<你的用户名>/intowild-site` |
| 生产分支 | `main` |
| 构建命令 | `npm run build` |
| 部署命令 | `npx wrangler deploy` |
| 根目录 | `/` |
| 环境变量 | `NODE_VERSION` = `24` |

> 面板文案可能随版本微调，认准「构建命令 / 部署命令 / 根目录」这三项即可。

### 5.4 绑域名

前提：域名已托管在同一个 Cloudflare 账号（NS 指向 Cloudflare）。

面板 → `intowild-site` → **Settings → Domains & Routes → Add → Custom domain**，依次添加：

1. `<你的域名>`（apex，主站）
2. `www.<你的域名>`（跳转用）

因为域名就在 Cloudflare，CNAME 会自动创建、证书会自动签发，不需要手动加记录。等状态变成 **Active**。

再把 `www` 301 到主域：**Rules → Redirect Rules → Create rule**

- 请求 URL：`www.<你的域名>/*`
- 目标：`https://<你的域名>/$1`，状态码 `301`

最后把 `wrangler.jsonc` 里的 `routes` 取消注释并填上域名，重新 `npx wrangler deploy` 一次。

### 5.5 DNS 记录长什么样

自动创建后应该能看到（**不要手改，除非自动创建失败**）：

| 类型 | 名称 | 内容 | 代理状态 | 用途 |
| --- | --- | --- | --- | --- |
| CNAME | `<你的域名>` | `intowild-site.<账号>.workers.dev` | 已代理（橙云） | 主站 |
| CNAME | `www` | `intowild-site.<账号>.workers.dev` | 已代理（橙云） | 跳转源 |

域名不在 Cloudflare 时，只能在自己的 DNS 服务商加 `www CNAME intowild-site.<账号>.workers.dev`，apex 需要 ALIAS/ANAME，多数国内 DNS 不支持——所以建议直接把 NS 迁到 Cloudflare。

### 5.6 上线验收

```bash
curl -I https://<你的域名>/            # 200
curl -I http://<你的域名>/             # 301 → https
curl -I https://www.<你的域名>/        # 301 → 主域
```

再手动过一遍：手机 4G 打开、五个页面都能点通、404 页正常、照片能显示。

## 6. 构建失败与回滚

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 页面没变化 | 浏览器缓存 | `Ctrl + Shift + R` 强刷 |
| 推送后线上没变 | 构建失败，站点继续用上一版 | 进 Deployments 点开最新一次构建看日志，报错会指向文件和行号 |
| 新版本有问题 | 需要撤回 | Deployments 里选一个此前的成功版本执行回滚 |
| 想从代码层面撤回 | 改动已提交 | `git revert <commit>` 后重新 `git push` |

本地构建失败最常见的原因：TypeScript 报错（`tsc --noEmit` 会拦住）、文件名大小写不一致、某个页面没在 `vite.config.ts` 里登记。

## 7. 不要改动的地方

- `dist/`：构建产物，每次部署都会重新生成，改动会被覆盖。
- `node_modules/`：依赖目录，不要手工编辑。
- Cloudflare 面板里的在线代码编辑器：改了不会进入 Git，下次部署会被覆盖。
- `public/_headers` 的语法：每条规则是「路径」+ 缩进两空格的「头名: 值」，缩进错了整条不生效。

## 8. 接手验收

按第 4 节完整执行一次「改一处文案 → `git push` → 等 1–2 分钟 → 强刷线上确认」，即视为环境正常。若构建记录没有出现，先确认本地分支是 `main`、远端是 `git@github.com:<你的用户名>/intowild-site.git`，以及 Cloudflare 的 Build 设置里生产分支填的是 `main`。
