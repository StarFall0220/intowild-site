import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GuestbookList } from './guestbook/List'
import './index.css'
import './guestbook.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GuestbookList />
  </StrictMode>,
)
