import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ActivityMap } from './activitymap'
import './index.css'
import './activitymap.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActivityMap />
  </StrictMode>,
)
