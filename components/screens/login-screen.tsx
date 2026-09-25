"use client"
import { db } from "@/lib/firebase"
import { ref, set, get } from "firebase/database"
import { useState } from "react"
import Image from "next/image"
import { setState, initialGuardian } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Eye, EyeOff } from "lucide-react"
export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [guardianName, setGuardianName] = useState("")
  const [error, setError] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const handleForgotPassword = async () => {
  if (!email) {
    setError("Please enter your email to reset password.")
    return
  }

  try {
    await sendPasswordResetEmail(auth, email)
    setError("Password reset email sent! Check your inbox.")
  } catch (err: any) {
    setError("Unable to send reset email. Please check the email address.")
  }
}
 const handleAuth = async () => {
  if (!email || !password) {
    setError("Please enter both email and password.")
    return
  }

  try {
    
   let userCredential

if (isSignup) {
  if (!guardianName) {
    setError("Please enter your name.")
    return
  }

  userCredential = await createUserWithEmailAndPassword(auth, email, password)

  const uid = userCredential.user.uid

  // 🔥 SAVE guardian in database
  await set(ref(db, `users/${uid}`), {
    name: guardianName,
    email: email,
  })

  setState({
    screen: "dashboard",
    guardian: {
      name: guardianName,
      email,
      uid,
    },
  })

} else {
  userCredential = await signInWithEmailAndPassword(auth, email, password)

  const uid = userCredential.user.uid

  // 🔥 FETCH guardian from database
 let userData = null

try {
  const snapshot = await get(ref(db, `users/${uid}`))
  userData = snapshot.exists() ? snapshot.val() : null
} catch (e) {
  console.log("User profile read failed, continuing with fallback")
}

setState({
  screen: "dashboard",
  guardian: {
    name: userData?.name || "Guardian",
    email: userData?.email || email,
    uid,
  },
})
}
  } catch (err: any) {
    console.error("FULL ERROR:", err)
  console.log("LOGIN ERROR:", err.code, err.message)

  switch (err.code) {
    case "auth/email-already-in-use":
      setError("This email is already registered. Please login instead.")
      break
    case "auth/user-not-found":
      setError("No account found with this email.")
      break
    case "auth/wrong-password":
      setError("Incorrect password. Please try again.")
      break
    case "auth/invalid-credential":
      setError("Invalid email or password.")
      break
    case "auth/invalid-email":
      setError("Please enter a valid email address.")
      break
    case "auth/weak-password":
      setError("Password should be at least 6 characters.")
      break
    case "auth/too-many-requests":
      setError("Too many attempts. Please wait and try again.")
      break
    default:
      setError(`Login failed: ${err.code || "unknown error"}`)
  }
}
}

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 pt-12 pb-8">
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/images/logo.png"
          alt="CarePulse Logo"
          width={100}
          height={100}
          className="rounded-xl"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-5">
        {isSignup && (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor="guardianName" className="text-foreground">
      Guardian Name
    </Label>
    <Input
      id="guardianName"
      type="text"
      placeholder="Enter your name"
      value={guardianName}
      onChange={(e) => setGuardianName(e.target.value)}
      className="h-12 border-border bg-card text-foreground"
    />
  </div>
)}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="guardian@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 border-border bg-card text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
  <Label htmlFor="password" className="text-foreground">
    Password
  </Label>

  <div className="relative">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="h-12 border-border bg-card pr-10 text-foreground"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

        <div className="flex justify-end">
          <button
            className="text-sm text-primary hover:underline"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        {error && (
          <p className="text-sm text-accent">{error}</p>
        )}

        <Button
          onClick={handleAuth}
          className="h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold"
        >
          {isSignup ? "Sign Up" : "Login"}
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
  {isSignup ? "Already registered?" : "New user?"}
  <span
    className="text-primary cursor-pointer ml-1"
    onClick={() => setIsSignup(!isSignup)}
  >
    {isSignup ? "Login here" : "Sign up here"}
  </span>
</p>
      </div>
    </div>
  )
}
