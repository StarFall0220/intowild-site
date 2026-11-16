/**
 * 全站文案与数据集中在这里。
 *
 * 约定：所有带尖括号 <...> 的内容都是占位，替换成真实内容时把尖括号一起删掉。
 * 不要在这里写没有确认过的事实（成立时间、人数、活动次数、赞助商、成员名单等）。
 * 新增一条活动 = 往 events 里加一个对象，页面会自动多一行。
 */

export const site = {
  name: 'intowild 户外社',
  en: 'intowild',
  tagline: '<一句话定位：我们带谁去哪里>',
  org: '<所属学校 / 院系 / 城市>',
  email: '<联系邮箱>',
  wechat: '<微信群 / 公众号名称>',
  /** 报名表链接；留空时按钮显示为“报名表待补充” */
  joinFormUrl: '',
}

/** 首页「下一次出发」卡片 */
export const nextTrip = {
  date: '<日期>',
  route: '<线路 / 目的地>',
  level: '<强度：休闲 / 中等 / 挑战>',
  seats: '<名额>',
  deadline: '<报名截止>',
}

export type EventStatus = '报名中' | '待定' | '已结束'

export interface ClubEvent {
  id: string
  date: string
  title: string
  place: string
  level: string
  status: EventStatus
}

/** 活动列表。三条是版式示例，换成真实活动；没有活动就把数组留空，页面会显示空状态。 */
export const events: ClubEvent[] = [
  { id: 'e1', date: '<日期>', title: '<活动名称>', place: '<集合地点>', level: '<强度>', status: '待定' },
  { id: 'e2', date: '<日期>', title: '<活动名称>', place: '<集合地点>', level: '<强度>', status: '待定' },
  { id: 'e3', date: '<日期>', title: '<活动名称>', place: '<集合地点>', level: '<强度>', status: '待定' },
]

/** 活动须知：改动这里，活动页底部三条同时更新 */
export const notices = [
  { title: '<装备要求>', body: '<必带装备、可借用装备、禁止携带的物品>' },
  { title: '<费用说明>', body: '<费用包含什么、怎么收、是否 AA>' },
  { title: '<退出与安全>', body: '<报名后怎么退出、遇恶劣天气怎么处理、保险安排>' },
]

export interface Photo {
  id: string
  caption: string
  /** 有真实图片时填 /photos/xxx.jpg，留空则显示占位块 */
  src: string
}

/** 图集：6 个占位格。把 src 填上、caption 换成地点/时间即可。 */
export const photos: Photo[] = [
  { id: 'p1', caption: '<活动照片 · 地点 / 日期>', src: '' },
  { id: 'p2', caption: '<活动照片 · 地点 / 日期>', src: '' },
  { id: 'p3', caption: '<活动照片 · 地点 / 日期>', src: '' },
  { id: 'p4', caption: '<活动照片 · 地点 / 日期>', src: '' },
  { id: 'p5', caption: '<活动照片 · 地点 / 日期>', src: '' },
  { id: 'p6', caption: '<活动照片 · 地点 / 日期>', src: '' },
]

/** 招新流程：三步，标题是通用流程，括号里填真实安排 */
export const joinSteps = [
  { step: '01', title: '填报名表', body: '<在哪填、要填什么、截止时间>' },
  { step: '02', title: '参加见面会', body: '<时间、地点、聊什么、能不能线上>' },
  { step: '03', title: '第一次出队', body: '<新手线路安排、装备怎么解决、谁来带>' },
]

export interface Faq {
  q: string
  a: string
}

export const faqs: Faq[] = [
  { q: '没有户外经验可以加入吗？', a: '<回答>' },
  { q: '活动费用怎么算？', a: '<回答>' },
  { q: '装备需要自己买吗？', a: '<回答>' },
]
