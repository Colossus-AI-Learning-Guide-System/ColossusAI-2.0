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
      isOpen={true}
      onClose={() => {}}
      userSubscription={currentPlan}
      defaultPanel="upgradePlan"
    />
  )
}

