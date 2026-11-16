import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Layout } from './components/Layout'
import { PageHead } from './components/PageHead'
import { Ph, Todo } from './components/Todo'
import { faqs, joinSteps, site } from './content'
import './index.css'
import './pages.css'

export default function Join() {
  return (
    <Layout active="join">
      <PageHead
        num="04"
        title="加入"
        lead={<Todo>招新时间、报名方式、以及第一次出队怎么跟上</Todo>}
      />

      <section className="section wrap" aria-labelledby="steps">
        <p className="label">/ 01 三步加入</p>
        <h2 className="h2" id="steps">
          从报名到第一次出队
        </h2>

        <ol className="steps">
          {joinSteps.map((s) => (
            <li className="step" key={s.step}>
              <span className="step-num">{s.step}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section wrap" aria-labelledby="signup">
        <div className="signup">
          <div>
            <p className="label">/ 02 报名</p>
            <h2 className="h2" id="signup">
              填个表，剩下的见面聊
            </h2>
            <p className="signup-note">
              <Todo>&lt;开放时间 / 审核方式 / 名额&gt;</Todo>
            </p>
          </div>

          <div className="signup-action">
            {site.joinFormUrl ? (
              <a className="btn btn-solid" href={site.joinFormUrl} target="_blank" rel="noreferrer">
                打开报名表
              </a>
            ) : (
              <span className="btn btn-disabled" aria-disabled="true">
                报名表待补充
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="section wrap" aria-labelledby="faq">
        <p className="label">/ 03 常见问题</p>
        <h2 className="h2" id="faq">
          你可能想问
        </h2>

        <div className="faq">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="contact-box">
          <p className="contact-label">还有别的问题</p>
          <p className="contact-line">
            邮箱 <Ph>{site.email}</Ph> · 微信 <Ph>{site.wechat}</Ph>
          </p>
        </div>
      </section>
    </Layout>
  )
}

// 这个 html 的入口：既定义页面，也负责挂载
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Join />
  </StrictMode>,
)
