"use client"

import type { ReactNode } from "react"

type ScreenLayoutProps = {
  title: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  children: ReactNode
}

export default function ScreenLayout({
  title,
  leftAction,
  rightAction,
  children,
}: ScreenLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 bg-primary px-5 pt-12 pb-5">
        <div>{leftAction}</div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-primary-foreground">
            {title}
          </h1>
        </div>

        <div>{rightAction}</div>
      </header>

      <div className="flex-1 px-5 py-5">
        {children}
      </div>
    </div>
  )
}