import { SettingsButton } from "@/app/components/ui/settings-button"
import { useState, useRef } from "react"
import styles from "./sidebar.module.css"
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import {
  getCurrentSession,
  getCurrentUser,
  signOut,
} from "@/lib/supabase/auth";

interface SidebarProps {
  onToggleRoadmap: () => void;
  isRoadmapVisible: boolean;
  onToggleContent: () => void;
  isContentVisible: boolean;
  onSidebarToggle?: (isExpanded: boolean) => void;
}

export default function Sidebar({ 
  onToggleRoadmap, 
  isRoadmapVisible,
  onToggleContent,
  isContentVisible,
  onSidebarToggle 
}: SidebarProps) {
  const [documents, setDocuments] = useState<File[]>([])
  const [isCollapsed, setIsCollapsed] = useState(true)
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
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onSidebarToggle?.(!newState);
  }

  const goToHome = () => {
    if (isRoadmapVisible) {
      onToggleRoadmap();
    }
    if (isContentVisible) {
      onToggleContent();
    }
    router.push('/')
  }

  const toggleRoadmap = () => {
    onToggleRoadmap()
  }

  const toggleContent = () => {
    onToggleContent()
  }

    const handleSignOut = async () => {
      try {
        const { error } = await signOut();
        if (error) throw error;
        router.push("/signin");
      } catch (err) {
        console.error("Sign out error:", err);
      }
    };

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.menuBar}>
        <div className={styles.sidebarControls}>
          <div className={styles.mainControls}>
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
            <button 
              className={`${styles.controlButton} ${isRoadmapVisible ? styles.active : ''}`} 
              onClick={toggleRoadmap}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12h6" />
                <path d="M15 12h6" />
                <path d="M12 3v6" />
                <path d="M12 15v6" />
              </svg>
            </button>
            <button 
              className={`${styles.controlButton} ${isContentVisible ? styles.active : ''}`} 
              onClick={toggleContent}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="16" y2="16" />
              </svg>
            </button>
          </div>
          <div className={styles.bottomControls}>
            <SettingsButton />
            <button 
              className={styles.controlButton}
              onClick={() => {/* Add help functionality */}}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
            <button 
              className={styles.logoutButton}
              onClick={handleSignOut}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.logo}>
          <Image 
            src="/favicon.ico"
            width={24}
            height={24}
            alt="Colossus AI Logo"
            className={styles.logoImage}
          />
          Colossus.Ai
        </div>
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
    </div>
  )
}

