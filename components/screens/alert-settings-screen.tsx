"use client"

import { useState } from "react"
import { setState, getState } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"

export default function AlertSettingsScreen() {
  const { alertSettings, darkMode } = useStore()
  const [settings, setSettings] = useState({ ...alertSettings })

  const handleSave = () => {
    setState({ alertSettings: settings, screen: "dashboard" })
  }

  const update = (key: string, value: number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 bg-card px-5 pt-12 pb-5 border-b border-border">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setState({ screen: "dashboard" })}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-xl font-bold text-foreground">Alert Settings</h1>
      </header>

      <div className="flex-1 px-5 py-6">
        <div className="flex flex-col gap-6">
          {/* Heart Rate Limits */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-foreground">Heart Rate Limits</h3>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">High Limit (BPM)</Label>
                <Input
                  type="number"
                  value={settings.heartRateHigh}
                  onChange={(e) => update("heartRateHigh", parseInt(e.target.value, 10) || 0)}
                  className="h-11 border-border bg-background text-foreground"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Low Limit (BPM)</Label>
                <Input
                  type="number"
                  value={settings.heartRateLow}
                  onChange={(e) => update("heartRateLow", parseInt(e.target.value, 10) || 0)}
                  className="h-11 border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* SpO2 Limits */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-foreground">SpO2 Limits</h3>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">High Limit (%)</Label>
                <Input
                  type="number"
                  value={settings.spo2High}
                  onChange={(e) => update("spo2High", parseInt(e.target.value, 10) || 0)}
                  className="h-11 border-border bg-background text-foreground"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Low Limit (%)</Label>
                <Input
                  type="number"
                  value={settings.spo2Low}
                  onChange={(e) => update("spo2Low", parseInt(e.target.value, 10) || 0)}
                  className="h-11 border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-foreground">Notifications</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Enable Heart Rate Alerts</Label>
                <Switch
                  checked={settings.enableHeartRateAlerts}
                  onCheckedChange={(v) => update("enableHeartRateAlerts", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Enable SpO2 Alerts</Label>
                <Switch
                  checked={settings.enableSpo2Alerts}
                  onCheckedChange={(v) => update("enableSpo2Alerts", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Enable Sound Alert</Label>
                <Switch
                  checked={settings.enableSoundAlert}
                  onCheckedChange={(v) => update("enableSoundAlert", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Enable Push Notification</Label>
                <Switch
                  checked={settings.enablePushNotification}
                  onCheckedChange={(v) => update("enablePushNotification", v)}
                />
              </div>
     <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-foreground">Dark Mode</p>
      <p className="text-sm text-muted-foreground">
        Enable dark theme for the app
      </p>
    </div>

    <button
      type="button"
      onClick={() => setState({ darkMode: !darkMode })}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
        darkMode ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-background shadow transition-transform duration-300 ${
          darkMode ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
</div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
