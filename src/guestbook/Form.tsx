import { useState } from 'react'
import { MAX_BODY, MAX_NAME, charCount, createMessage, errorText, type CreateError } from './api'

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok'; total: number; duplicate: boolean }
  | { kind: 'error'; code: CreateError }

/** 主站留言框：匿名、无需登录、提交后立即落库 */
export function GuestbookForm() {
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const len = charCount(body)
  const tooLong = len > MAX_BODY
  const sending = status.kind === 'sending'
  const canSubmit = len > 0 && !tooLong && !sending

  async function submit() {
    if (!canSubmit) return
    setStatus({ kind: 'sending' })
    const res = await createMessage(body, name)
    if (res.ok) {
      setBody('')
      setStatus({ kind: 'ok', total: res.total ?? 0, duplicate: !!res.duplicate })
    } else {
      setStatus({ kind: 'error', code: res.error ?? 'UNKNOWN' })
    }
  }

  return (
    <section className="gb" aria-labelledby="gb-title">
      <p className="gb-label" id="gb-title">
        / 留言
      </p>

      <div className="gb-field">
        <label className="gb-sr" htmlFor="gb-body">
          留言内容
        </label>
        <textarea
          id="gb-body"
          className="gb-input"
          rows={3}
          maxLength={MAX_BODY + 40}
          placeholder="路过的话，留一句。"
          value={body}
          disabled={sending}
          onChange={(e) => {
            setBody(e.target.value)
            if (status.kind !== 'idle') setStatus({ kind: 'idle' })
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              void submit()
            }
          }}
        />
      </div>

      <div className="gb-row">
        <label className="gb-sr" htmlFor="gb-name">
          昵称（选填）
        </label>
        <input
          id="gb-name"
          className="gb-name"
          type="text"
          maxLength={MAX_NAME}
          placeholder="昵称（选填）"
          value={name}
          disabled={sending}
          onChange={(e) => setName(e.target.value)}
        />

        <span className={tooLong ? 'gb-count is-over' : 'gb-count'} aria-live="polite">
          {len} / {MAX_BODY}
        </span>

        <button type="button" className="gb-submit" onClick={() => void submit()} disabled={!canSubmit}>
          {sending ? '发送中…' : '发送'}
        </button>
      </div>

      <div className="gb-status" aria-live="polite">
        {status.kind === 'error' && <p className="gb-err">{errorText(status.code)}</p>}
      </div>
    </section>
  )
}
