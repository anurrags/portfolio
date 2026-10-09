import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../shared/styles.css'
import { Drop } from './Drop'

/**
 * Entry for the WiFi file drop — `drop.html`, served at `/drop`. Loads nothing
 * from the portfolio or the editor.
 */

const container = document.getElementById('root')
if (!container) throw new Error('#root missing from drop.html')

createRoot(container).render(
  <StrictMode>
    <Drop />
  </StrictMode>,
)
