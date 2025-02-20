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
          <div className={styles.chatArea}>
            <div className={styles.welcomeMessage}>
              How can I help you?
            </div>
            <div className={styles.chatInput}>
              <input type="text" placeholder="Type here..." />
              <button onClick={handleSend} className={styles.arrowButton} style={{ borderRadius: '50%', padding: '10px', border: 'none' }}>
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

