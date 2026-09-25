"use client"

import { setState } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Siren } from "lucide-react"

export default function EmergencyScreen() {
  const { patients, selectedPatientId } = useStore()
  const patient = patients.find((p) => p.id === selectedPatientId)

  if (!patient) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Red Warning Banner */}
      <div className="bg-red-600 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Siren className="h-8 w-8 text-red-100 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold text-red-50">EMERGENCY ALERT</h1>
            <p className="text-sm text-red-200">Abnormal Condition Detected</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-6 px-5 py-8">
        {/* Animated Alert Icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-red-500/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <h2 className="text-center text-xl font-bold text-foreground">
          Abnormal Condition Detected
        </h2>

        {/* Patient Details */}
        <div className="w-full rounded-xl border-2 border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient Name</span>
              <span className="font-semibold text-foreground">{patient.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Patient ID</span>
              <span className="font-semibold text-foreground">{patient.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Band ID</span>
              <span className="font-semibold text-foreground">{patient.bandId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Abnormal Value</span>
              <span className="font-bold text-red-600">{patient.heartRate} BPM - High</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-auto flex w-full flex-col gap-3">
          <Button
            variant="ghost"
            onClick={() =>
              setState({ screen: "patientDetail", selectedPatientId: patient.id })
            }
            className="h-12 text-muted-foreground"
          >
            Back to Patient
          </Button>
        </div>
      </div>
    </div>
  )
}
