# intowild户外社 站点交接文档

**现状**：**已上线**，`https://intowild.online` 可访问（`www` 301 跳主域）。Vite + React（TypeScript）单页站点，源码在 GitHub（`StarFall0220/intowild-site`），Cloudflare Workers 托管。日常只需要改源码、提交、推送，或本地 `npx wrangler deploy`。

> 本文记录的是这个站点从本地到上线的搭建与维护方式。动手前先执行 `ls` 和 `git log --oneline -5` 核对工作区，以文件系统里的实际内容为准。

## 1. 基本情况

| 项 | 值 |
| --- | --- |
| 域名 | `intowild.online`（Spaceship 注册，NS 托管到 Cloudflare） |
| 技术栈 | Vite + React（TypeScript） |
| 托管 | Cloudflare Workers（Static Assets） |
| 项目名 | `intowild-site` |
| 本地路径 | `C:\Users\tong7\Documents\intowild-site` |
| 代码仓库 | `git@github.com:StarFall0220/intowild-site.git`，分支 `main` |
| 线上地址 | `https://intowild.online`（`www.intowild.online` 301 跳主域） |
| 测试地址 | `https://intowild-site.2858367707.workers.dev`（`workers_dev: true`，每次部署都更新） |
| 子域名 | `https://activitymap.intowild.online`（活动地图页，同一个 Worker 按 hostname 分流） |

部署参数：构建命令 `npm run build`，部署命令 `npx wrangler deploy`，静态产物目录 `./dist`（由 `wrangler.jsonc` 的 `assets.directory` 指定）。

Node 装在 `C:\node`（v24.22.1），PATH 里可能没有，所以 `start-dev.cmd` 里写死了 `set "PATH=C:\node;%PATH%"`。

## 2. 页面构成

只有一个主页，整屏黑底：

1. 顶栏：左侧 `■ intowild`，右侧 `intowild.online`
2. 主区：小标题 `OUTDOOR CLUB · 上海` → 大标题 `intowild / 户外社` → 一句话定位 `Into the wild, out of the ordinary.`
3. 底栏：一行 `© 年份 intowild户外社`
4. 右下角固定一个 `活动地图 ↗` 浮动按钮，跳 `https://activitymap.intowild.online`

另有两个非主页面的入口：

- **活动地图**：`activitymap.intowild.online` → 渲染 `dist/activitymap.html`（`src/activitymap.tsx`），当前是「地图待接入」的骨架页。
- **404 兜底页**：`public/404.html`，纯静态、不在任何导航里，只有访问不存在的路径时才会出现。

## 3. 改什么文件

| 想改什么 | 改哪个文件 |
| --- | --- |
| 社团名、所属学校/城市、一句话定位 | `src/App.tsx` 顶部的 `SITE` |
| 版式、字号、间距 | `src/index.css` |
| 配色 | `src/index.css` 的 `:root` 变量 |
| 浏览器标签标题与分享卡片 | `index.html` |
| 404 页 | `public/404.html` |
| 安全头与缓存策略 | `public/_headers` |
| www 跳转、响应头 | `worker/index.ts` |
| 域名 | `wrangler.jsonc` 的 `routes` + `worker/index.ts` 的 `APEX` + 各处的 `canonical` |

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
   git commit -m "content: 更新一句话定位"
   git push
   ```

5. 等自动构建，1–2 分钟。进度看 **Cloudflare → Workers & Pages → Workers → `intowild-site` → Deployments**。

6. 打开 `https://intowild.online`，按 `Ctrl + Shift + R` 强刷确认。也可以用命令：

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://intowild.online/
   ```

## 5. 首次上线步骤

### 5.1 建仓库并推送

GitHub 新建仓库 `intowild-site`（Public），然后：

```bash
cd "C:\Users\tong7\Documents\intowild-site"
git remote add origin git@github.com:<你的用户名>/intowild-site.git
git push -u origin main
```

### 5.2 登录 Cloudflare 并手动部署一次

```bash
cd "C:\Users\tong7\Documents\intowild-site"
npx wrangler login      # 只做一次，浏览器里点授权
npm run build
npx wrangler deploy
```

成功后终端会给出 `https://intowild-site.<你的账号>.workers.dev`，先在这个地址验收。
`wrangler.jsonc` 里 `workers_dev: true`，所以每次部署都会更新这个测试地址。

> 第一次 deploy 时如果 `intowild.online` 还没接进 Cloudflare，会报找不到 zone。先做 5.4，或临时把 `routes` 注释掉再部署。

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

### 5.4 接域名、绑到 Worker

**第一步：把域名接进 Cloudflare。** 域名在 Spaceship 注册，当前 NS 是 `launch1/launch2.spaceship.net`。

1. Cloudflare → **Add a site** → 输入 `intowild.online` → 选 Free 计划 → 记下分配的两个 NS（形如 `xxx.ns.cloudflare.com`）。
2. Spaceship 后台 → 该域名 → **Nameservers** → 改成 Custom nameservers，填这两个。
3. 回 Cloudflare 点 **Check nameservers**，状态变成 **Active** 再往下走（通常 10 分钟–2 小时，最长 24 小时）。

**第二步：绑到 Worker。** `wrangler.jsonc` 的 `routes` 已经写好两个域名，直接部署：

```bash
npm run build
npx wrangler deploy
```

Cloudflare 会自动创建 CNAME 并签发证书，状态在 **Settings → Domains & Routes** 里看，变 **Active** 即可。

> 也可以在面板里手动 Add custom domain，效果一样。

**www 跳主域**：已经在 `worker/index.ts` 里处理（`www.intowild.online` → 301 `intowild.online`），不需要再配 Redirect Rule——两边都配会重复跳转。

### 5.5 DNS 记录长什么样

自动创建后应该能看到（**不要手改，除非自动创建失败**）：

| 类型 | 名称 | 内容 | 代理状态 | 用途 |
| --- | --- | --- | --- | --- |
| CNAME | `intowild.online` | `intowild-site.<账号>.workers.dev` | 已代理（橙云） | 主站 |
| CNAME | `www` | `intowild-site.<账号>.workers.dev` | 已代理（橙云） | 跳转源 |
| CNAME | `activitymap` | `intowild-site.<账号>.workers.dev` | 已代理（橙云） | 活动地图子域 |

域名不在 Cloudflare 时，只能在自己的 DNS 服务商加 `www CNAME intowild-site.<账号>.workers.dev`，apex 需要 ALIAS/ANAME，多数国内 DNS 不支持——所以建议直接把 NS 迁到 Cloudflare。

### 5.6 上线验收

```bash
curl -I https://intowild.online/            # 200
curl -I http://intowild.online/             # 301 → https
curl -I https://www.intowild.online/        # 301 → 主域
curl -I https://intowild.online/no-such     # 404，且是自定义 404 页
```

再手动过一遍：手机 4G 打开，黑底、标题 `intowild户外社`、无横向滚动。

## 6. 构建失败与回滚

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 页面没变化 | 浏览器缓存 | `Ctrl + Shift + R` 强刷 |
| 推送后线上没变 | 构建失败，站点继续用上一版 | 进 Deployments 点开最新一次构建看日志，报错会指向文件和行号 |
| 新版本有问题 | 需要撤回 | Deployments 里选一个此前的成功版本执行回滚 |
| 想从代码层面撤回 | 改动已提交 | `git revert <commit>` 后重新 `git push` |

本地构建失败最常见的原因：TypeScript 报错（`tsc --noEmit` 会拦住）、文件名大小写不一致。

## 7. 不要改动的地方

- `dist/`：构建产物，每次部署都会重新生成，改动会被覆盖。
- `node_modules/`：依赖目录，不要手工编辑。
- Cloudflare 面板里的在线代码编辑器：改了不会进入 Git，下次部署会被覆盖。
- `public/_headers` 的语法：每条规则是「路径」+ 缩进两空格的「头名: 值」，缩进错了整条不生效。
- `wrangler.jsonc` 的 `assets`：**不要**加 `html_handling: "none"`，实测会让首页 `/` 直接 404；默认值才对。

## 8. 接手验收

按第 4 节完整执行一次「改一处文案 → `git push` → 等 1–2 分钟 → 强刷线上确认」，即视为环境正常。若构建记录没有出现，先确认本地分支是 `main`、远端是 `git@github.com:<你的用户名>/intowild-site.git`，以及 Cloudflare 的 Build 设置里生产分支填的是 `main`。

## 9. 上线记录（2026-11-16）

| 项 | 值 |
| --- | --- |
| Cloudflare zone ID | `cf450f9e453809e8f6e718404509a3d0` |
| 分配到的 NS | `adrian.ns.cloudflare.com` / `bradley.ns.cloudflare.com` |
| 自定义域 | `intowild.online`、`www.intowild.online`、`activitymap.intowild.online`（均 `custom_domain: true`） |
| 证书 | Universal SSL，自动签发 |

上线过程中踩到并处理掉的两个坑，改了这里的东西前先读一遍：

1. **DNSSEC 的 DS 记录不匹配会让整站 SERVFAIL。** Spaceship 默认给域名开了 DNSSEC 并自动发布 DS；一旦把 NS 指向 Cloudflare，注册局的 DS 仍指向 Spaceship 的密钥，所有带校验的解析器直接返回 SERVFAIL（表现为 `curl` 返回 `000`，看起来像"没部署好"）。处理办法是在 Spaceship 把 DNSSEC **禁用**，等 DS 从注册局消失。
   > 以后若想重新开 DNSSEC：必须在 Cloudflare 侧开启，再把 Cloudflare 给出的 DS 记录加到 Spaceship。**不要只在一边开。**

2. **自定义域会被已存在的 A 记录挡住。** 添加站点时 Cloudflare 会自动导入原注册商的停放 A 记录，`wrangler deploy` 会报 `Hostname 'intowild.online' already has externally managed DNS records ... [code: 100117]`。删掉那两条 A 记录后再部署即可。
