"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { setState } from "@/lib/store"

export default function SplashScreen() {
  const [logoVisible, setLogoVisible] = useState(false)
  const [floatY, setFloatY] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 300)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    let frame: number
    let t = 0

    const animate = () => {
      t += 0.015
      setFloatY(Math.sin(t) * 6)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setState({ screen: "login" })
    }, 5000)

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-transparent px-5 pt-12 pb-8">
      <div className="flex flex-1 items-center justify-center">
        <div
          className="transition-all duration-[2000ms] ease-out"
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: `translateY(${logoVisible ? floatY : 30}px) scale(${logoVisible ? 1 : 0.85})`,
          }}
        >
          <Image
            src="/images/logo.png"
            alt="CarePulse Logo"
            width={200}
            height={200}
            className="drop-shadow-lg"
            priority
          />
        </div>
      </div>
    </div>
  )
}