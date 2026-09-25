export interface Patient {
  id: string
  name: string
  age: number
  gender: "Male" | "Female" | "Other"
  bandId: string
  guardianId: string
  heartRate: number
  spo2: number
  status: "normal" | "abnormal"
  history: VitalRecord[]
}

export interface VitalRecord {
  timestamp: string
  heartRate: number
  spo2: number
}

export interface Guardian {
  id: string
  name: string
  email: string
}

export interface AlertSettings {
  heartRateHigh: number
  heartRateLow: number
  spo2High: number
  spo2Low: number
  enableHeartRateAlerts: boolean
  enableSpo2Alerts: boolean
  enableSoundAlert: boolean
  enablePushNotification: boolean
}

export interface AbnormalAlert {
  patientId: string
  patientName: string
  bandId: string
  reading: string
  type: "heartRate" | "spo2"
  timestamp: string
}
