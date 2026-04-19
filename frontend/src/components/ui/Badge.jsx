import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-700 font-semibold',
    danger: 'bg-red-100 text-red-700 font-semibold',
    warning: 'bg-orange-100 text-orange-700 font-semibold',
    info: 'bg-blue-100 text-blue-700 font-semibold',
    outline: 'border border-slate-200 text-slate-600',
  }
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs", variants[variant], className)} {...props}>
      {children}
    </span>
  )
}
