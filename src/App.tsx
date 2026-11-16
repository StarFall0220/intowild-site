import { Layout } from './components/Layout'
import { Todo } from './components/Todo'
import { nextTrip, site } from './content'
import './index.css'
import './pages.css'

export default function App() {
  return (
    <Layout active="home">
      <section className="hero wrap">
        <div className="hero-main">
          <p className="kicker">
            OUTDOOR CLUB · <Todo>{site.org}</Todo>
          </p>
          <h1 className="hero-title">{site.name}</h1>
          <p className="hero-lead">
            <Todo>{site.tagline}</Todo>
          </p>
          <div className="actions">
            <a className="btn btn-solid" href="/join.html">
              加入我们
            </a>
            <a className="btn btn-line" href="/activities.html">
              看活动安排
            </a>
          </div>
        </div>

        <aside className="trip" aria-labelledby="trip-title">
          <p className="trip-label" id="trip-title">
            下一次出发
          </p>
          <dl className="trip-list">
            <div>
              <dt>日期</dt>
              <dd>{nextTrip.date}</dd>
            </div>
            <div>
              <dt>线路</dt>
              <dd>{nextTrip.route}</dd>
            </div>
            <div>
              <dt>强度</dt>
              <dd>{nextTrip.level}</dd>
            </div>
            <div>
              <dt>名额</dt>
              <dd>{nextTrip.seats}</dd>
            </div>
            <div>
              <dt>报名截止</dt>
              <dd>{nextTrip.deadline}</dd>
            </div>
          </dl>
          <a className="trip-link" href="/activities.html">
            全部活动 →
          </a>
        </aside>
      </section>

      <section className="section wrap" aria-labelledby="entries">
        <p className="label">/ 01 站内入口</p>
        <h2 className="h2" id="entries">
          想去哪，从这儿进
        </h2>

        <div className="cards">
          <a className="card" href="/activities.html">
            <span className="card-num">01</span>
            <h3 className="card-title">活动安排</h3>
            <p className="card-desc">本学期的出队计划、集合信息、报名状态，都在这页。</p>
            <span className="card-go">前往 →</span>
          </a>
          <a className="card" href="/gallery.html">
            <span className="card-num">02</span>
            <h3 className="card-title">活动图集</h3>
            <p className="card-desc">出队时拍的照片，按地点和时间归档。</p>
            <span className="card-go">前往 →</span>
          </a>
          <a className="card" href="/join.html">
            <span className="card-num">03</span>
            <h3 className="card-title">如何加入</h3>
            <p className="card-desc">报名流程、见面会安排、第一次出队怎么跟上。</p>
            <span className="card-go">前往 →</span>
          </a>
        </div>
      </section>

      <section className="section wrap about-strip" aria-labelledby="about-brief">
        <div className="about-brief">
          <p className="label">/ 02 关于我们</p>
          <h2 className="h2" id="about-brief">
            先认识一下
          </h2>
        </div>
        <div className="about-text">
          <p>
            <Todo>
              &lt;社团简介：2–3 句，说明我们是谁、常去哪儿、活动频率。不写没确认过的人数或历史&gt;
            </Todo>
          </p>
          <p>
            <a className="text-link" href="/about.html">
              完整的社团介绍 →
            </a>
          </p>
        </div>
      </section>

      <section className="band">
        <div className="wrap band-inner">
          <div>
            <p className="label label-light">/ 03 加入</p>
            <p className="band-title">下次出发，一起走一段。</p>
          </div>
          <a className="btn btn-paper" href="/join.html">
            看怎么加入
          </a>
        </div>
      </section>
    </Layout>
  )
}
