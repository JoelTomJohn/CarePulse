import type { Patient, Guardian, AlertSettings, AbnormalAlert, VitalRecord } from "./types"

export function generateHistory(days: number): VitalRecord[] {
  const records: VitalRecord[] = []
  const now = new Date()
  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    records.push({
      timestamp: timestamp.toISOString(),
      heartRate: Math.floor(60 + Math.random() * 30),
      spo2: Math.floor(94 + Math.random() * 6),
    })
  }
  return records
}

const initialPatients: Patient[] = [
  {
    id: "P001",
    name: "John Mathew",
    age: 72,
    gender: "Male",
    bandId: "BND1001",
    guardianId: "G001",
    heartRate: 78,
    spo2: 97,
    status: "normal",
    history: [],
  },
  {
    id: "P002",
    name: "Mary Thomas",
    age: 68,
    gender: "Female",
    bandId: "BND1002",
    guardianId: "G001",
    heartRate: 82,
    spo2: 96,
    status: "normal",
    history: generateHistory(30),
  },
  {
    id: "P003",
    name: "Robert Wilson",
    age: 75,
    gender: "Male",
    bandId: "BND1003",
    guardianId: "G001",
    heartRate: 74,
    spo2: 98,
    status: "normal",
    history: generateHistory(30),
  },
]

const initialGuardian: Guardian = {
  id: "G001",
  name: "Sarah",
  email: "sarah@carepulse.com",
}

const defaultAlertSettings: AlertSettings = {
  heartRateHigh: 100,
  heartRateLow: 50,
  spo2High: 100,
  spo2Low: 90,
  enableHeartRateAlerts: true,
  enableSpo2Alerts: true,
  enableSoundAlert: true,
  enablePushNotification: true,
}

export type AppScreen =
  | "splash"
  | "login"
  | "dashboard"
  | "addPatient"
  | "patientDetail"
  | "alertSettings"
  | "emergency"

export interface AppState {
  screen: AppScreen
  guardian: Guardian | null
  patients: Patient[]
  selectedPatientId: string | null
  alertSettings: AlertSettings
  abnormalAlert: AbnormalAlert | null
  dismissedAlert: boolean
  darkMode: boolean
}

const initialState: AppState = {
  screen: "splash",
  guardian: null,
  patients: initialPatients,
  selectedPatientId: null,
  alertSettings: defaultAlertSettings,
  abnormalAlert: null,
  dismissedAlert: false,
  darkMode: false,
}
function loadState(): AppState {
  if (typeof window === "undefined") return { ...initialState }

  const savedGuardian = sessionStorage.getItem("guardian")
  const savedScreen = sessionStorage.getItem("screen")
  const savedAlertSettings = sessionStorage.getItem("alertSettings")
  const savedDarkMode = sessionStorage.getItem("darkMode")

  return {
    ...initialState,
    guardian: savedGuardian ? JSON.parse(savedGuardian) : null,
    screen: savedGuardian ? ((savedScreen as AppScreen) || "dashboard") : "login",
    alertSettings: savedAlertSettings
      ? JSON.parse(savedAlertSettings)
      : defaultAlertSettings,
    darkMode: savedDarkMode === "true",
  }
}

function persistState(nextState: AppState) {
  if (typeof window === "undefined") return

  if (nextState.guardian) {
    sessionStorage.setItem("guardian", JSON.stringify(nextState.guardian))
    sessionStorage.setItem("screen", nextState.screen)
  } else {
    sessionStorage.removeItem("guardian")
    sessionStorage.removeItem("screen")
  }

  sessionStorage.setItem(
    "alertSettings",
    JSON.stringify(nextState.alertSettings)
  )
  sessionStorage.setItem("darkMode", String(nextState.darkMode))
}
type Listener = () => void

let state = { ...initialState }
const listeners = new Set<Listener>()

export function getState(): AppState {
  return state
}

export function setState(partial: Partial<AppState>) {
  state = { ...state, ...partial }
  persistState(state)
  listeners.forEach((l) => l())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getNextPatientId(): string {
  const nums = state.patients.map((p) => parseInt(p.id.replace("P", ""), 10))
  const next = Math.max(...nums) + 1
  return `P${String(next).padStart(3, "0")}`
}

export function addPatient(patient: Patient) {
  setState({ patients: [...state.patients, patient] })
}

export function triggerAbnormal(patientId: string) {
  const patient = state.patients.find((p) => p.id === patientId)
  if (!patient) return

  const updatedPatients = state.patients.map((p) =>
    p.id === patientId
      ? { ...p, heartRate: 120, status: "abnormal" as const }
      : p
  )
  setState({
    patients: updatedPatients,
    abnormalAlert: {
      patientId: patient.id,
      patientName: patient.name,
      bandId: patient.bandId,
      reading: "120 BPM - High",
      type: "heartRate",
      timestamp: new Date().toISOString(),
    },
    dismissedAlert: false,
  })
}

export function resolveAbnormal(patientId: string) {
  const updatedPatients = state.patients.map((p) =>
    p.id === patientId
      ? { ...p, heartRate: 75, status: "normal" as const }
      : p
  )
  setState({
    patients: updatedPatients,
    abnormalAlert: null,
    dismissedAlert: false,
  })
}

export function dismissAlert() {
  setState({ dismissedAlert: true })
}
export function logout() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("guardian")
    sessionStorage.removeItem("screen")
    sessionStorage.removeItem("alertSettings")
    sessionStorage.removeItem("darkMode")
  }

  state = {
    ...initialState,
    screen: "login",
    guardian: null,
  }

  listeners.forEach((l) => l())
}
export { initialGuardian, defaultAlertSettings }
