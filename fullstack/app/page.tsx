"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChatColumn } from "@/components/chat-column"
import { RoadmapColumn } from "@/components/roadmap-column"
import { ContentColumn } from "@/components/content-column"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function Page() {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showContent, setShowContent] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <div
          className="grid h-[calc(100vh-3.5rem)] w-full transition-all duration-300"
          style={{
            gridTemplateColumns: `1fr ${showRoadmap ? "1fr" : "0fr"} ${showContent ? "1fr" : "0fr"}`,
          }}
        >
          <ChatColumn onSend={() => setShowRoadmap(true)} />
          {showRoadmap && <RoadmapColumn onClick={() => setShowContent(true)} />}
          {showContent && <ContentColumn />}
        </div>
      </SidebarInset>
    </div>
  )
}

