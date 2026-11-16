import type { ReactNode } from 'react'
import { Todo } from './components/Todo'
import './index.css'

/**
 * 单页站点。要改文案，只改下面这 4 个常量。
 * 值以 < 开头会渲染成橙色占位框；填成正常文字就自动变成普通文本。
 */
const SITE = {
  name: 'intowild户外社',
  en: 'intowild',
  /** 所属学校 / 城市 */
  org: '上海',
  /** 一句话定位 */
  tagline: 'Into the wild, out of the ordinary.',
}

/** 以 < 开头视为未填的占位，其余按普通文字渲染 */
function Ph({ value }: { value: string }): ReactNode {
  return value.trim().startsWith('<') ? <Todo>{value}</Todo> : value
}

export default function App() {
  return (
    <main className="page">
      <header className="bar">
        <span className="brand">
          <i className="mark" aria-hidden="true" />
          {SITE.en}
        </span>
        <span className="host">intowild.online</span>
      </header>

      <section className="stage">
        <p className="kicker">
          OUTDOOR CLUB · <Ph value={SITE.org} />
        </p>

        <h1 className="title">
          <span>{SITE.en}</span>
          <span className="title-cn">户外社</span>
        </h1>

        <p className="lead">
          <Ph value={SITE.tagline} />
        </p>
      </section>

      <footer className="base">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <span>Vite · React · Cloudflare Workers</span>
      </footer>
    </main>
  )
}
