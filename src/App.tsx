import type { ReactNode } from 'react'
import { Todo } from './components/Todo'
import { ThemeToggle } from './components/ThemeToggle'
import { GuestbookForm } from './guestbook/Form'
import './index.css'
import './guestbook.css'

/**
 * 单页站点。要改文案，只改下面这 4 个常量。
 * 值以 < 开头会渲染成橙色占位框；填成正常文字就自动变成普通文本。
 */
const SITE = {
  name: 'Into Wild 户外社',
  en: 'Into Wild',
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
        <span className="bar-right">
          <span className="host">intowild.online</span>
          <ThemeToggle />
        </span>
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

        <GuestbookForm />
      </section>

      <footer className="base">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        {/* 背景图由 OpenStreetMap 数据生成，ODbL 要求署名，别删 */}
        <span className="credit">
          地图数据 ©{' '}
          <a href="https://www.openstreetmap.org/copyright" rel="noreferrer noopener" target="_blank">
            OpenStreetMap
          </a>{' '}
          contributors
        </span>
      </footer>

      {/* 浮动入口：固定在右下角，跳转到活动地图子域名 */}
      <a
        className="fab"
        href="https://activitymap.intowild.online"
        aria-label="打开活动地图（activitymap.intowild.online）"
      >
        <span className="fab-dot" aria-hidden="true" />
        活动地图
        <span className="fab-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
    </main>
  )
}
