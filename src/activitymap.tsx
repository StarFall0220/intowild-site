/**
 * 活动地图页（activitymap.intowild.online）
 *
 * 目前是骨架：标题 + 地图占位 + 说明。接地图时把 <div className="map-blank"> 换成
 * 真实地图组件即可（Leaflet / Mapbox / 高德都行），其余版式不用动。
 */

export function ActivityMap() {
  return (
    <main className="map-page">
      <header className="map-bar">
        <a className="map-back" href="https://intowild.online">
          ← intowild.online
        </a>
        <span className="map-tag">ACTIVITY MAP</span>
      </header>

      <section className="map-head">
        <h1 className="map-title">活动地图</h1>
        <p className="map-lead">把每次出队去过的地方，标在同一张图上。</p>
      </section>

      <section className="map-canvas" aria-label="地图区域">
        <div className="map-blank" role="img" aria-label="地图待接入">
          <span className="map-blank-dot" aria-hidden="true" />
          地图待接入
        </div>
        <p className="map-note">
          目前是骨架页。接入地图数据后，这里会按时间列出每个活动地点。
        </p>
      </section>

      <footer className="map-foot">
        <span>Into Wild 户外社</span>
        <a href="https://intowild.online">返回主页 ↗</a>
      </footer>
    </main>
  )
}
