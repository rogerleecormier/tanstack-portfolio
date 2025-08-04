import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRouter } from './router'
import { initializeSearchIndex } from './utils/searchIndex'
import './index.css'

// Initialize search index
initializeSearchIndex().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
)