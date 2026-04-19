import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Farms from './pages/Farms'
import FraudDetection from './pages/FraudDetection'
import FarmAnalysis from './pages/FarmAnalysis'
import ClaimResult from './pages/ClaimResult'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="farms/:id" element={<FarmAnalysis />} />
        <Route path="fraud" element={<FraudDetection />} />
        <Route path="claims/result" element={<ClaimResult />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
