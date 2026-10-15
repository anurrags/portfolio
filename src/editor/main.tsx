import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import '../shared/styles.css'
import { EDITOR_HOME } from '../shared/paths'
import { Home } from './routes/Home'
import { Room } from './routes/Room'

/**
 * Entry for the collaborative code editor — `editor.html`, served at
 * `/editor` and `/editor/<id>`. Loads nothing from the portfolio or /drop.
 */

const container = document.getElementById('root')
if (!container) throw new Error('#root missing from editor.html')

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={EDITOR_HOME} element={<Home />} />
        <Route path={`${EDITOR_HOME}/:roomId`} element={<Room />} />
        <Route path="/editor" element={<Navigate to={EDITOR_HOME} replace />} />
        <Route path="*" element={<Navigate to={EDITOR_HOME} replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
