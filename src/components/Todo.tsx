import type { ReactNode } from 'react'

/** 占位标记：虚线框 + 等宽字，提醒这里还没填。 */
export function Todo({ children }: { children: ReactNode }) {
  return (
    <span className="todo" title="待补充：替换为真实内容">
      {children}
    </span>
  )
}

/**
 * 智能占位：文本以 < 开头就渲染成 Todo 样式，填了真内容就自动变成普通文字。
 * 用法：<Ph>{site.email}</Ph>
 */
export function Ph({ children }: { children: string }) {
  return children.trim().startsWith('<') ? <Todo>{children}</Todo> : <>{children}</>
}
