import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BattleView } from '@/pages/BattleView'
import { BattleList } from '@/pages/BattleList'
import { NotFound } from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="w-full h-full">
          <Routes>
            <Route path="/" element={<BattleList />} />
            <Route path="/battle/:battleId" element={<BattleView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
