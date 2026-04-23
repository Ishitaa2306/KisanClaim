import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Farms from './pages/Farms'
import FraudDetection from './pages/FraudDetection'
import FarmAnalysis from './pages/FarmAnalysis'
import ClaimResult from './pages/ClaimResult'
import RiskMatrix from './pages/RiskMatrix'
import ClaimLogs from './pages/ClaimLogs'
import Settings from './pages/Settings'
import MapVisualization from './pages/MapVisualization'
import Report from './pages/Report'
import MobileContainer from './pages/mobile/MobileContainer'
import Claims from './pages/Claims'
import FinancialAnalytics from './pages/FinancialAnalytics'
import DamageAnalytics from './pages/DamageAnalytics'
import RiskList from './pages/RiskList'

function App() {
  return (
    <Routes>
      <Route path="/mobile/*" element={<MobileContainer />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="farms/:id" element={<FarmAnalysis />} />
        <Route path="farm/:id" element={<FarmAnalysis />} />
        <Route path="case/:id" element={<FarmAnalysis />} />
        <Route path="analysis/:id" element={<FarmAnalysis />} />
        <Route path="fraud" element={<FraudDetection />} />
        <Route path="claims" element={<Claims />} />
        <Route path="claims/result" element={<ClaimResult />} />
        <Route path="analytics/financial" element={<FinancialAnalytics />} />
        <Route path="analytics/damage" element={<DamageAnalytics />} />
        <Route path="risk" element={<RiskMatrix />} />
        <Route path="risk/list" element={<RiskList />} />
        <Route path="report/:id" element={<Report />} />
        <Route path="map" element={<MapVisualization />} />
        <Route path="logs" element={<ClaimLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
