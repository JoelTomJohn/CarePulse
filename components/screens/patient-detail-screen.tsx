"use client"

import { useState, useMemo, useEffect } from "react"
import { setState, triggerAbnormal, resolveAbnormal } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Heart,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Siren,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { db } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
export default function PatientDetailScreen() {
  const { patients, selectedPatientId, guardian } = useStore()
  const patient = patients.find((p) => p.id === selectedPatientId)
  const [historyRange, setHistoryRange] = useState<"daily" | "weekly" | "monthly">("daily")
  const [historyData, setHistoryData] = useState<any[]>([])
  useEffect(() => {
  if (!patient?.bandId) {
    setHistoryData([])
    return
  }

  const readingsRef = ref(db, `vitals/${patient.bandId}/readings`)

  onValue(readingsRef, (snapshot) => {
    const data = snapshot.val()

    if (!data) {
      setHistoryData([])
      return
    }

    const formatted = Object.values(data).map((reading: any) => ({
      heartRate: reading.heartRate || 0,
      spo2: reading.spo2 ?? -1,
      status: reading.status || "normal",
      timestamp: reading.timestamp || 0,
    }))

    setHistoryData(formatted)
  })
}, [patient?.bandId])
  const filteredHistory = useMemo(() => {
  const now = new Date()
  let hours = 24
  if (historyRange === "weekly") hours = 24 * 7
  if (historyRange === "monthly") hours = 24 * 30

  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000)

  return historyData
    .filter((r) => new Date(r.timestamp * 1000) >= cutoff)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      ...r,
      time: new Date(r.timestamp * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))
}, [historyData, historyRange])

  const stats = useMemo(() => {
    if (!filteredHistory.length)
      return { avgHr: 0, avgSpo2: 0, maxHr: 0, minHr: 0, maxSpo2: 0, minSpo2: 0 }
    const hrs = filteredHistory.map((r) => r.heartRate)
    const spo2s = filteredHistory.map((r) => r.spo2)
    return {
      avgHr: Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length),
      avgSpo2: Math.round(spo2s.reduce((a, b) => a + b, 0) / spo2s.length),
      maxHr: Math.max(...hrs),
      minHr: Math.min(...hrs),
      maxSpo2: Math.max(...spo2s),
      minSpo2: Math.min(...spo2s),
    }
  }, [filteredHistory])

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 bg-primary px-5 pt-12 pb-5">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setState({ screen: "dashboard" })}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-primary-foreground">{patient.name}</h1>
          <p className="text-sm text-primary-foreground/70">
            {patient.id} &middot; Band: {patient.bandId}
          </p>
        </div>
      </header>

      {/* Patient Info Card */}
      <div className="mx-5 -mt-2 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground">
          <span>
            <span className="text-muted-foreground">Age:</span> {patient.age}
          </span>
          <span>
            <span className="text-muted-foreground">Gender:</span> {patient.gender}
          </span>
          <span>
            <span className="text-muted-foreground">Guardian:</span> {guardian?.name || "N/A"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="live" className="mt-4 flex flex-1 flex-col px-5 pb-5">
        <TabsList className="grid w-full grid-cols-2 bg-secondary">
          <TabsTrigger value="live">Live Status</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Live Status Tab */}
        <TabsContent value="live" className="flex flex-1 flex-col gap-4 pt-4">
          {/* Vital Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <Heart className="h-8 w-8 text-accent" />
              <span className="text-3xl font-bold text-foreground">{patient.heartRate}</span>
              <span className="text-xs text-muted-foreground">Heart Rate (BPM)</span>
              <div className="flex items-center gap-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    patient.status === "normal" ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 shadow-sm">
              <Droplets className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold text-foreground">
  {patient.spo2 >= 0 ? `${patient.spo2}%` : "N/A"}
</span>
              <span className="text-xs text-muted-foreground">SpO2</span>
              <div className="flex items-center gap-1">
                <div
                  className={`h-2 w-2 rounded-full ${
                    patient.status === "normal" ? "bg-emerald-500" : "bg-red-500 animate-pulse"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </div>
          </div>

          {/* Alert Status */}
          {patient.status === "normal" ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <span className="font-medium text-emerald-800">No Active Alerts</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-800">Abnormal Reading Detected</p>
                <p className="text-sm text-red-600">Heart Rate: {patient.heartRate} BPM</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            {patient.status === "normal" ? (
              <Button
                onClick={() => triggerAbnormal(patient.id)}
                className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                SOS Trigger (Simulate)
              </Button>
            ) : (
              <>
                <Button
                  onClick={() =>
                    setState({ screen: "emergency", selectedPatientId: patient.id })
                  }
                  className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                >
                  <Siren className="mr-2 h-4 w-4" />
                  View Emergency
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resolveAbnormal(patient.id)}
                  className="h-12 font-semibold"
                >
                  Resolve (Back to Normal)
                </Button>
              </>
            )}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="flex flex-1 flex-col gap-4 pt-4">
          <h3 className="text-lg font-semibold text-foreground">Health History</h3>

          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setHistoryRange(range)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  historyRange === range
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
{filteredHistory.length === 0 && (
  <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
    <p className="text-base font-medium">No history available yet</p>
    <p className="mt-1 text-sm">Vitals will appear once readings are received</p>
  </div>
)}

          {/* Chart */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredHistory.filter((_, i) => i % Math.max(1, Math.floor(filteredHistory.length / 50)) === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2"
                  stroke="#1E3A8A"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg Heart Rate</p>
              <p className="text-xl font-bold text-accent">{stats.avgHr} BPM</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg SpO2</p>
              <p className="text-xl font-bold text-primary">{stats.avgSpo2}%</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Highest HR</p>
              <p className="text-lg font-semibold text-foreground">{stats.maxHr} BPM</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="text-xs text-muted-foreground">Lowest HR</p>
              <p className="text-lg font-semibold text-foreground">{stats.minHr} BPM</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
