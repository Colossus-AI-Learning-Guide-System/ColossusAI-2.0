"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { SettingsPanel } from "@/app/components/settings-panel"

export function SettingsButton() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-full">
        <Settings className="h-5 w-5" />
        <span className="sr-only">Open settings</span>
      </Button>

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}

