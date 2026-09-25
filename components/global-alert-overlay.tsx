"use client"

import { useEffect, useRef } from "react"
import { setState, dismissAlert, resolveAbnormal } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

export default function GlobalAlertOverlay() {
  const { abnormalAlert, dismissedAlert } = useStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (abnormalAlert && !dismissedAlert) {
      try {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()
        oscillator.connect(gain)
        gain.connect(ctx.destination)
        oscillator.frequency.value = 880
        oscillator.type = "square"
        gain.gain.value = 0.1
        oscillator.start()
        setTimeout(() => {
          oscillator.stop()
          ctx.close()
        }, 800)
      } catch {
        // Audio not available
      }
    }
  }, [abnormalAlert, dismissedAlert])

  if (!abnormalAlert) return null

  // Dismissed banner
  if (dismissedAlert) {
    return (
      <div className="fixed top-0 right-0 left-0 z-50 bg-red-600 px-4 py-2">
        <button
          onClick={() =>
            setState({
              screen: "patientDetail",
              selectedPatientId: abnormalAlert.patientId,
            })
          }
          className="flex w-full items-center justify-between text-sm text-red-50"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alert: {abnormalAlert.patientName} - {abnormalAlert.reading}
          </span>
          <span className="underline">View</span>
        </button>
      </div>
    )
  }

  // Full modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
      <div className="mx-6 w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl border-2 border-red-500 bg-card p-6 shadow-2xl">
        {/* Flashing Red Border Effect */}
        <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-red-500 opacity-50" />

        <div className="relative flex flex-col items-center gap-4">
          {/* Alert Icon */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-red-500/30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
          </div>

          <h2 className="text-center text-lg font-bold text-red-600">
            ABNORMAL CONDITION DETECTED
          </h2>

          <div className="w-full rounded-lg bg-red-50 p-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-semibold text-foreground">{abnormalAlert.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-semibold text-foreground">{abnormalAlert.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Band</span>
                <span className="font-semibold text-foreground">{abnormalAlert.bandId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reading</span>
                <span className="font-bold text-red-600">{abnormalAlert.reading}</span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              onClick={() =>
                setState({
                  screen: "patientDetail",
                  selectedPatientId: abnormalAlert.patientId,
                  dismissedAlert: true,
                })
              }
              className="h-11 bg-red-600 text-red-50 hover:bg-red-700 font-semibold"
            >
              View Patient Details
            </Button>
            <Button
              variant="outline"
              onClick={() => dismissAlert()}
              className="h-11 border-red-200 text-red-600 hover:bg-red-50"
            >
              Dismiss Alert
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
