import type { ReactNode } from 'react'

/**
 * 占位标记：橙色虚线框。
 * 用法：<Todo>&lt;联系方式&gt;</Todo>
 * 填好真内容后，把整个 <Todo>…</Todo> 换成普通文字即可。
 */
export function Todo({ children }: { children: ReactNode }) {
  return (
    <span className="todo" title="待补充：替换为真实内容">
      {children}
    </span>
  )
}
