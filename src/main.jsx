import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Poppins (bundled, no Google CDN) so the app works offline in the
// native iOS/Capacitor shell and passes App Store review.
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/poppins/latin-800.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
