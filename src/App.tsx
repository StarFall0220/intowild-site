import { Todo } from './components/Todo'
import './index.css'

/**
 * 单页站点。要改文案，直接改下面这 4 个常量；
 * 带尖括号的是占位，换成真实内容时把尖括号一起删掉。
 */
const SITE = {
  name: 'intowild户外社',
  en: 'intowild',
  /** 所属学校 / 城市 */
  org: '<所属学校 / 城市>',
  /** 一句话定位，20–40 字 */
  tagline: '<一句话定位：我们带谁去哪里>',
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
          OUTDOOR CLUB · <Todo>{SITE.org}</Todo>
        </p>

        <h1 className="title">
          <span>{SITE.en}</span>
          <span className="title-cn">户外社</span>
        </h1>

        <p className="lead">
          <Todo>{SITE.tagline}</Todo>
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
