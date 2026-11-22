-- 留言板表结构：一条留言 = 一行，只追加，不合并、不覆盖
-- 应用：wrangler d1 execute intowild-guestbook --file=./schema.sql --remote

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,          -- ULID/随机 ID，天然有序且不可猜
  created_at INTEGER NOT NULL,          -- 服务端时间（epoch ms），不信任客户端
  body       TEXT NOT NULL,             -- 正文，1–280 字符
  name       TEXT,                      -- 可选昵称，≤24 字符
  client_id  TEXT,                      -- 浏览器随机 ID，用于去重与限流
  ip_hash    TEXT,                      -- HMAC(IP, 日盐)，只做风控，不外露
  status     TEXT NOT NULL DEFAULT 'ok' -- ok / hidden（管理端隐藏）
);

CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_ip ON messages(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id, created_at);
