"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { SettingsPanel } from "@/app/components/settings-panel"

// Example user data - in a real app, this would come from your auth system
const mockUserData = {
  permissions: ["general", "upgrade"], // User only has access to general and upgrade sections
  subscription: "free", // User is on free tier
  featureFlags: {
    securitySettings: true,
    memoryManagement: true, // Memory feature is not yet available
  },
}

export function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Open settings</span>
      </Button>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userPermissions={mockUserData.permissions}
        userSubscription={mockUserData.subscription}
        featureFlags={mockUserData.featureFlags}
      />
    </>
  )
}