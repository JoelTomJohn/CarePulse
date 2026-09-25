"use client"
import { ref, push, set, get } from "firebase/database"
import { db } from "@/lib/firebase"
import { useState } from "react"
import { setState, addPatient, getNextPatientId } from "@/lib/store"
import { useStore } from "@/hooks/use-store"
import type { Patient } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export default function AddPatientScreen() {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male")
  const [bandId, setBandId] = useState("")
  const [error, setError] = useState("")
  const { guardian } = useStore()

  const handleSave = async () => {
    if (!name || !age || !bandId) {
      setError("Please fill in all fields.")
      return
    }
    // 🔒 Validate BAND format
const bandPattern = /^BAND\d+$/

if (!bandPattern.test(bandId)) {
  setError("Band ID must be in format BAND followed by numbers (e.g., BAND01)")
  return
}

const patientsRef = ref(db, "patients")
const patientsSnapshot = await get(ref(db, "patients"))
const patientsData = patientsSnapshot.val() || {}

const bandAlreadyUsed = Object.values(patientsData).some(
  (patient: any) => patient.bandId === bandId
)

if (bandAlreadyUsed) {
  setError("This Band ID is already assigned to another patient.")
  return
}
const newPatientRef = push(patientsRef)

await set(newPatientRef, {
  displayId: `P${Date.now().toString().slice(-3)}`, // simple temporary format
  name,
  age: parseInt(age, 10),
  gender,
  bandId,
  guardianId: guardian?.uid || "",
})
    setState({ screen: "dashboard" })
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
        <h1 className="text-xl font-bold text-primary-foreground">Add Patient</h1>
      </header>

      <div className="flex-1 px-5 py-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-foreground">Patient Name</Label>
            <Input
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 border-border bg-card text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age" className="text-foreground">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-12 border-border bg-card text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-foreground">Gender</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female" | "Other")}>
              <SelectTrigger className="h-12 border-border bg-card text-foreground">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bandId" className="text-foreground">Band ID</Label>
            <Input
              id="bandId"
              placeholder="e.g. BAND1004"
              value={bandId}
              onChange={(e) => setBandId(e.target.value.toUpperCase())}
              className="h-12 border-border bg-card text-foreground"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="mt-4 flex flex-col gap-3">
            <Button
              onClick={handleSave}
              className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold"
            >
              Save Patient
            </Button>
            <Button
              variant="outline"
              onClick={() => setState({ screen: "dashboard" })}
              className="h-12 text-base"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
