import React from 'react'
import { Card } from './ui/Card'
import { Construction } from 'lucide-react'

export function PlaceholderPage({ title }) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        </div>
      </div>
      <Card className="p-16 flex flex-col items-center justify-center text-center min-h-[50vh] border-dashed border-2 border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <Construction className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Under Construction</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          The {title} module is currently being finalized for the production release. It will integrate directly with our central intelligence pipeline.
        </p>
      </Card>
    </div>
  )
}
