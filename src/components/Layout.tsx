import type { ReactNode } from 'react'
import { Ph } from './Todo'
import { site } from '../content'

export type NavKey = 'home' | 'activities' | 'gallery' | 'about' | 'join'

const NAV: { href: string; label: string; key: NavKey; num: string }[] = [
  { href: '/', label: '首页', key: 'home', num: '00' },
  { href: '/activities.html', label: '活动', key: 'activities', num: '01' },
  { href: '/gallery.html', label: '图集', key: 'gallery', num: '02' },
  { href: '/about.html', label: '关于', key: 'about', num: '03' },
  { href: '/join.html', label: '加入', key: 'join', num: '04' },
]

export function Layout({ active, children }: { active: NavKey | null; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        跳到主要内容
      </a>

      <header className="site-head">
        <div className="wrap head-inner">
          <a className="brand" href="/" aria-label={`${site.name} 首页`}>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-name">{site.en}</span>
            <span className="brand-sub">户外社</span>
          </a>

          <nav className="nav" aria-label="主导航">
            {NAV.map((n) => (
              <a
                key={n.key}
                href={n.href}
                className={active === n.key ? 'nav-link is-on' : 'nav-link'}
                aria-current={active === n.key ? 'page' : undefined}
              >
                <span className="nav-num" aria-hidden="true">
                  {n.num}
                </span>
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="site-foot">
        <div className="wrap foot-grid">
          <div className="foot-brand">
            <p className="foot-name">{site.name}</p>
            <p className="foot-tag">
              <Ph>{site.tagline}</Ph>
            </p>
          </div>

          <div className="foot-col">
            <p className="foot-label">联系</p>
            <p>
              <Ph>{site.email}</Ph>
            </p>
            <p>
              <Ph>{site.wechat}</Ph>
            </p>
          </div>

          <div className="foot-col">
            <p className="foot-label">页面</p>
            {NAV.filter((n) => n.key !== 'home').map((n) => (
              <p key={n.key}>
                <a href={n.href}>{n.label}</a>
              </p>
            ))}
          </div>
        </div>

        <div className="wrap foot-base">
          <span>
            © {new Date().getFullYear()} {site.name}
          </span>
          <span>Vite · React · Cloudflare Workers</span>
        </div>
      </footer>
    </>
  )
}
