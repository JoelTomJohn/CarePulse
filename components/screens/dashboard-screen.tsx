"use client"

import { useState, useEffect } from "react"
import { setState } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, Droplets, ChevronRight, Plus, Settings, LogOut } from "lucide-react"
import { db } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"

export default function DashboardScreen() {
  const { guardian, patients, alertSettings } = useStore()
  console.log("UID:", guardian?.uid)

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [removeMode, setRemoveMode] = useState(false)
  const [selectedPatients, setSelectedPatients] = useState<string[]>([])

  useEffect(() => {
    const patientsRef = ref(db, "patients")
    const vitalsRef = ref(db, "vitals")

    onValue(patientsRef, (patientsSnapshot) => {
      const patientsData = patientsSnapshot.val()
      if (!patientsData) {
        setState({ patients: [] })
        return
      }

      onValue(vitalsRef, (vitalsSnapshot) => {
        const vitalsData = vitalsSnapshot.val()
        const currentGuardianId = guardian?.uid

        const formattedPatients = Object.entries(patientsData)
          .filter(([_, patient]: any) => patient.guardianId === currentGuardianId)
          .map(([id, patient]: any) => {
            const bandId = patient.bandId || ""
            const latest = vitalsData?.[bandId]?.latestReading || {}

            const heartRate = latest.heartRate ?? 0
            const spo2 = latest.spo2 ?? -1

            const computedStatus =
              heartRate > alertSettings.heartRateHigh ||
              heartRate < alertSettings.heartRateLow ||
              (spo2 >= 0 &&
                (spo2 < alertSettings.spo2Low || spo2 > alertSettings.spo2High))
                ? "abnormal"
                : "normal"

            return {
              id,
              displayId: patient.displayId || id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender || "—",
              bandId: bandId,
              heartRate,
              spo2,
              status: computedStatus,
            }
          })

        setState({ patients: formattedPatients })
      })
    })
  }, [guardian, alertSettings])

  const sortedPatients = [...patients].sort((a: any, b: any) => {
    const calculateSeverity = (patient: any) => {
      let severity = 0

      if (patient.heartRate > alertSettings.heartRateHigh) {
        severity += patient.heartRate - alertSettings.heartRateHigh
      }

      if (patient.heartRate < alertSettings.heartRateLow) {
        severity += alertSettings.heartRateLow - patient.heartRate
      }

      if (patient.spo2 >= 0 && patient.spo2 < alertSettings.spo2Low) {
        severity += alertSettings.spo2Low - patient.spo2
      }

      if (patient.spo2 >= 0 && patient.spo2 > alertSettings.spo2High) {
        severity += patient.spo2 - alertSettings.spo2High
      }

      return severity
    }

    const aSeverity = calculateSeverity(a)
    const bSeverity = calculateSeverity(b)

    if (a.status !== b.status) {
      return a.status === "abnormal" ? -1 : 1
    }

    if (a.status === "abnormal") {
      return bSeverity - aSeverity
    }

    return 0
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 pt-12 pb-5">
        <div>
          <p className="text-sm text-muted-foreground">Welcome,</p>
          <h1 className="text-xl font-bold text-foreground">
            {guardian?.name || "Guardian"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setState({ screen: "alertSettings" })}
            className="text-foreground hover:bg-muted"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowLogoutConfirm(true)}
            className="text-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Patients</h2>

          <div className="flex gap-2">
            <Button
              onClick={() => setState({ screen: "addPatient" })}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>

            <Button
              onClick={() => setRemoveMode(!removeMode)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              size="sm"
            >
              {removeMode ? "Cancel" : "Remove"}
            </Button>
          </div>
        </div>

        {removeMode && (
          <Button
            className="mb-3 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              if (selectedPatients.length === 0) {
                alert("Select patients first")
                return
              }

              const confirmDelete = window.confirm("Delete selected patients?")
              if (!confirmDelete) return

              const { ref, remove } = await import("firebase/database")

              for (const id of selectedPatients) {
                await remove(ref(db, `patients/${id}`))
              }

              setSelectedPatients([])
              setRemoveMode(false)
            }}
          >
            Delete Selected
          </Button>
        )}

        <div className="flex flex-col gap-4">
          {sortedPatients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
              <p className="text-base font-medium">No patients added yet</p>
              <p className="mt-1 text-sm">Tap "Add Patient" to get started</p>
            </div>
          ) : (
            sortedPatients.map((patient: any) => (
              <div key={patient.id} className="flex items-center">
                {removeMode && (
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => {
                      setSelectedPatients((prev) =>
                        prev.includes(patient.id)
                          ? prev.filter((p) => p !== patient.id)
                          : [...prev, patient.id]
                      )
                    }}
                    className="mr-3"
                  />
                )}

                <button
                  onClick={() =>
                    !removeMode &&
                    setState({ screen: "patientDetail", selectedPatientId: patient.id })
                  }
                  className="flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        patient.status === "normal"
                          ? "bg-emerald-500"
                          : "bg-red-500 animate-pulse"
                      }`}
                    />
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {patient.status}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-foreground">
                        {patient.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {patient.displayId}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>Age: {patient.age}</span>
                      <span>{patient.gender}</span>
                      <span>Band: {patient.bandId}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-4">
                      <span className="flex items-center gap-1 text-sm font-medium text-accent">
                        <Heart className="h-3.5 w-3.5" />
                        {patient.heartRate} BPM
                      </span>

                      <span className="flex items-center gap-1 text-sm font-medium text-primary">
                        <Droplets className="h-3.5 w-3.5" />
                        {patient.spo2 >= 0 ? `${patient.spo2}%` : "N/A"}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-xs rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setState({ screen: "login", guardian: null })}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}