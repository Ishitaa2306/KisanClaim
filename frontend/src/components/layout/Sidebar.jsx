import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Satellite, Activity, FileText, Settings, Plus, Map } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

export function Sidebar() {
  const location = useLocation()
  
  const navItems = [
    { label: 'Risk Matrix', icon: Activity, path: '/risk' },
    { label: 'Map Visualization', icon: Map, path: '/map' },
    { label: 'Claim Logs', icon: FileText, path: '/logs' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]
  
  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-16 pt-6 z-10">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-primary">Intelligence Lab</h2>
        <p className="text-xs text-slate-400 font-medium tracking-wider mt-1">AERIAL GUARDIAN VIEW</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                isActive 
                  ? "bg-slate-50 text-primary" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-6">
        <Button className="w-full flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New Analysis
        </Button>
      </div>
    </aside>
  )
}
