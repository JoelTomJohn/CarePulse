"use client"
import { useEffect } from "react"
import { useStore } from "@/hooks/use-store"
import { getState, setState, generateHistory } from "@/lib/store"
import SplashScreen from "@/components/screens/splash-screen"
import LoginScreen from "@/components/screens/login-screen"
import DashboardScreen from "@/components/screens/dashboard-screen"
import AddPatientScreen from "@/components/screens/add-patient-screen"
import PatientDetailScreen from "@/components/screens/patient-detail-screen"
import AlertSettingsScreen from "@/components/screens/alert-settings-screen"
import EmergencyScreen from "@/components/screens/emergency-screen"
import GlobalAlertOverlay from "@/components/global-alert-overlay"

export default function AppShell() {
  const { screen, darkMode } = useStore()

  useEffect(() => {
    const current = getState()

    if (
      current.patients.length > 0 &&
      current.patients[0].history.length === 0
    ) {
      const updatedPatients = current.patients.map((p) => ({
        ...p,
        history: generateHistory(30),
      }))

      setState({ patients: updatedPatients })
    }
  }, [])

  return (
    <div className={darkMode ? "dark min-h-screen w-full bg-background text-foreground" : "min-h-screen w-full bg-background text-foreground"}>
      <div className="relative min-h-screen w-full bg-background text-foreground transition-colors">
        {screen === "splash" && <SplashScreen />}
        {screen === "login" && <LoginScreen />}
        {screen === "dashboard" && <DashboardScreen />}
        {screen === "addPatient" && <AddPatientScreen />}
        {screen === "patientDetail" && <PatientDetailScreen />}
        {screen === "alertSettings" && <AlertSettingsScreen />}
        {screen === "emergency" && <EmergencyScreen />}
        <GlobalAlertOverlay />
      </div>
    </div>
  )
}