import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BattleView } from '@/pages/BattleView'
import { BattleList } from '@/pages/BattleList'
import { AdminPage } from '@/pages/AdminPage'
import { NotFound } from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { LanguageToggle } from '@/components/shared/LanguageToggle'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <div style={{ position: 'fixed', inset: 0 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/battles" replace />} />
            <Route path="/battles" element={<BattleList />} />
            <Route path="/battle/:battleId" element={<BattleView />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* Language toggle — always visible, top-right corner */}
          <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 50 }}>
            <LanguageToggle />
          </div>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
