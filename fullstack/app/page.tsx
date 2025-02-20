"use client"

import { useState } from "react"
import styles from "./page.module.css"
import Sidebar from "./components/Sidebar/page"
import Roadmap from "./components/Roadmap/page"
import Content from "./components/Content/page"

export default function Dashboard() {
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const handleSend = () => {
    setShowRoadmap(true)
  }

  const handleRoadmapClick = () => {
    setShowContent(true)
  }

  return (
    <main className={styles.dashboard}>
      <Sidebar />
      <div className={styles.mainContent}>
        {showRoadmap && (
          <div className={styles.roadmapSection}>
            <Roadmap onRoadmapClick={handleRoadmapClick} />
          </div>
        )}
        {showContent && (
          <div className={styles.contentSection}>
            <Content />
          </div>
        )}
        <div className={styles.chatSection}>
          <div className={styles.chatInput}>
            <input type="text" placeholder="Type here..." />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </main>
  )
}

