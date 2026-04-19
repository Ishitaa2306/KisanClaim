import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-8 pb-20">
          <Outlet />
        </div>
        
        {/* Footer */}
        <footer className="pl-64 pr-8 py-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 fixed bottom-0 w-full bg-white z-10">
          <div>
            <span className="font-bold text-slate-800">KisanClaim</span> © 2024 PRECISION HARVEST & TECH. ALL SATELLITE DATA VERIFIED.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-600">DOCUMENTATION</a>
            <a href="#" className="hover:text-slate-600">SYSTEM STATUS</a>
            <a href="#" className="hover:text-slate-600">PRIVACY POLICY</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
