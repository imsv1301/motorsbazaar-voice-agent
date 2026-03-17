import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { VoiceAgentPage } from './pages/VoiceAgentPage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoiceAgentPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
