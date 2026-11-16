import type { ReactNode } from 'react'

/** 内页统一抬头：编号 + 标题 + 一句导语 */
export function PageHead({
  num,
  title,
  lead,
}: {
  num: string
  title: string
  lead: ReactNode
}) {
  return (
    <header className="page-head wrap">
      <p className="page-num">/ {num}</p>
      <h1 className="page-title">{title}</h1>
      <p className="page-lead">{lead}</p>
    </header>
  )
}
