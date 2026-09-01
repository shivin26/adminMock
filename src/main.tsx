import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  localStorage.removeItem('digilocal_admin_vendors_list');
  localStorage.removeItem('digilocal_admin_pending_vendors_list');
  localStorage.removeItem('digilocal_support_tickets_store');
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
