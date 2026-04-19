import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-card rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]", className)} {...props}>
      {children}
    </div>
  )
}
