import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Navbar() {
  const location = useLocation()
  
  const topNav = [
    { label: 'Dashboard', path: '/' },
    { label: 'Farms', path: '/farms' },
    { label: 'Fraud Detection', path: '/fraud' },
    { label: 'Claims', path: '/claims' },
  ]
  
  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 w-full z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
          KisanClaim
        </Link>
        <nav className="hidden md:flex gap-8">
          {topNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors border-b-2 py-5",
                location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                  ? "border-primary text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-400 tracking-wider">
          SATELLITE-VERIFIED CROP INSURANCE
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-300 text-slate-500">
          <User size={16} />
        </div>
      </div>
    </header>
  )
}
