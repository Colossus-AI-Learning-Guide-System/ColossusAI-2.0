"use client"

import { useState, useRef } from "react"
import styles from "./sidebar.module.css"
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const [documents, setDocuments] = useState<File[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAddDocument = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf')
      setDocuments(prev => [...prev, ...pdfFiles])
    }
  }

  const handleDeleteDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const goToHome = () => {
    router.push('/')
  }

  return (
    <>
      <div className={styles.menuBar}>
        <div className={styles.sidebarControls}>
          <button className={styles.controlButton} onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isCollapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
          <button className={styles.controlButton} onClick={goToHome}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logo}>Colossus.Ai</div>
        <div className={styles.section}>
          <h2>Recent</h2>
          <div className={styles.recentContent}>{/* Add recent items here */}</div>
        </div>
        <div className={styles.section}>
          <h2>Documents</h2>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
          />
          <button className={styles.addButton} onClick={handleAddDocument}>
            + Add document
          </button>
          <div className={styles.documentList}>
            {documents.map((doc, index) => (
              <div key={index} className={styles.documentItem}>
                <svg 
                  className={styles.pdfIcon}
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span className={styles.documentName}>{doc.name}</span>
                <button 
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteDocument(index)
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

