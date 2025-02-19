"use client"

import { useState } from "react"
import { SettingsPanel } from "../components/settings-panel"

export default function UpgradePlanPage() {
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [cardData, setCardData] = useState(null)
  const [currentPlan, setCurrentPlan] = useState("free")
  const [cardAdded, setCardAdded] = useState(false)

  return (
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
      defaultPanel="upgradePlan"
    />
  )
}

