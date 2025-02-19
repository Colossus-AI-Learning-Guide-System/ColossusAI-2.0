"use client"

import { useState, useEffect } from "react"
import { Button } from "./components/ui/button"
import { SettingsPanel } from "./components/settings-panel"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [cardData, setCardData] = useState<any>(null)
  const [currentPlan, setCurrentPlan] = useState("Standard")
  const [cardAdded, setCardAdded] = useState(false)

  // Load saved data on component mount
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData')
    const savedCardData = localStorage.getItem('cardData')
    
    if (savedUserData) {
      const data = JSON.parse(savedUserData)
      setFullName(data.fullName || '')
      setUsername(data.username || '')
      setEmail(data.email || '')
    }
    
    if (savedCardData) {
      setCardData(JSON.parse(savedCardData))
      setCardAdded(true)
    }
  }, [])

  const handleOpenSettings = () => {
    router.push("/settings?modal=true") // Open settings with modal
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to Your Dashboard</h1>
      <Button onClick={handleOpenSettings}>Open Settings</Button>

      <SettingsPanel
        fullName={fullName}
        setFullName={setFullName}
        username={username}
        setUsername={setUsername}
        email={email}
        setEmail={setEmail}
        cardData={cardData}
        setCardData={setCardData}
        currentPlan={currentPlan}
        setCurrentPlan={setCurrentPlan}
        cardAdded={cardAdded}
        setCardAdded={setCardAdded}
      />
    </main>
  )
}

