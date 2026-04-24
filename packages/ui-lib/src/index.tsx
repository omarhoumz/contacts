import type { PropsWithChildren } from 'react'

export function Card({ children }: PropsWithChildren) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-card-foreground shadow-card">
      {children}
    </div>
  )
}
