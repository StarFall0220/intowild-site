import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Layout } from './components/Layout'
import { PageHead } from './components/PageHead'
import { Ph, Todo } from './components/Todo'
import { site } from './content'
import './index.css'
import './pages.css'

export default function About() {
  return (
    <Layout active="about">
      <PageHead
        num="03"
        title="关于"
        lead={<Todo>这个社团是谁在组织、平时做什么、怎么找到我们</Todo>}
      />

      <div className="section wrap about-grid">
        <div className="about-rail">
          <p className="label">/ 我们是谁</p>
        </div>
        <div className="about-body">
          <p>
            <Todo>
              &lt;第一段：社团全称、所属单位、成立的契机。不要写没确认过的年份和人数&gt;
            </Todo>
          </p>
          <p>
            <Todo>
              &lt;第二段：我们通常去哪儿、一年大概几次活动、对新人什么态度&gt;
            </Todo>
          </p>
        </div>

        <div className="about-rail">
          <p className="label">/ 我们做什么</p>
        </div>
        <div className="about-body">
          <ul className="plain-list">
            <li>
              <strong>常规活动</strong>
              <span>
                <Todo>&lt;频率、时长、典型线路&gt;</Todo>
              </span>
            </li>
            <li>
              <strong>特别活动</strong>
              <span>
                <Todo>&lt;假期长线、与其他社团的联合活动&gt;</Todo>
              </span>
            </li>
            <li>
              <strong>新人活动</strong>
              <span>
                <Todo>&lt;面向零基础的活动形式&gt;</Todo>
              </span>
            </li>
          </ul>
        </div>

        <div className="about-rail">
          <p className="label">/ 谁在组织</p>
        </div>
        <div className="about-body">
          <ul className="plain-list">
            <li>
              <strong>负责人</strong>
              <span>
                <Todo>&lt;姓名 / 职务 / 联系方式&gt;</Todo>
              </span>
            </li>
            <li>
              <strong>指导老师</strong>
              <span>
                <Todo>&lt;姓名 / 单位&gt;</Todo>
              </span>
            </li>
            <li>
              <strong>技术维护</strong>
              <span>
                <Todo>&lt;谁负责这个网站，换届时交接给谁&gt;</Todo>
              </span>
            </li>
          </ul>
        </div>

        <div className="about-rail">
          <p className="label">/ 怎么联系</p>
        </div>
        <div className="about-body">
          <ul className="plain-list">
            <li>
              <strong>邮箱</strong>
              <span>
                <Ph>{site.email}</Ph>
              </span>
            </li>
            <li>
              <strong>微信</strong>
              <span>
                <Ph>{site.wechat}</Ph>
              </span>
            </li>
            <li>
              <strong>线下</strong>
              <span>
                <Todo>&lt;活动室 / 摆摊位置 / 见面会地点&gt;</Todo>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}

// 这个 html 的入口：既定义页面，也负责挂载
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <About />
  </StrictMode>,
)
