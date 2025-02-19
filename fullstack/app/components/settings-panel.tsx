"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { X } from "lucide-react"
import { useImageUpload } from "../hooks/use-image-upload"
import { PlanUpgradeDialog } from "../components/plan-upgrade-dialog"
import { AddCardDialog } from "../components/add-card-dialog"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

// Validation functions
const validateName = (name: string) => {
  // Allow letters, spaces, hyphens, and apostrophes
  return /^[A-Za-zÀ-ÿ\s'-]+$/.test(name) || name === ""
}
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

type ActivePanel = "general" | "upgradePlan" | "addCard"

interface SettingsPanelProps {
  fullName?: string
  setFullName?: (value: string) => void
  username?: string
  setUsername?: (value: string) => void
  email?: string
  setEmail?: (value: string) => void
  cardData?: any
  setCardData?: (value: any) => void
  currentPlan?: string
  setCurrentPlan?: (value: string) => void
  cardAdded?: boolean
  setCardAdded?: (value: boolean) => void
  defaultPanel?: "general" | "upgradePlan" | "addCard"
}

export function SettingsPanel({
  fullName = "",
  setFullName = () => {},
  username = "",
  setUsername = () => {},
  email = "",
  setEmail = () => {},
  cardData = null,
  setCardData = () => {},
  currentPlan = "free",
  setCurrentPlan = () => {},
  cardAdded = false,
  setCardAdded = () => {},
  defaultPanel = "general",
}: SettingsPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for modal and active panel
  const isModalParam = searchParams.get("modal") === "true"
  const [isOpen, setIsOpen] = useState(isModalParam)
  const [activePanel, setActivePanel] = useState<ActivePanel>("general")
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload()

  // State for validation
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  })
  const [isFormValid, setIsFormValid] = useState(false)

  // Sync modal state with URL
  useEffect(() => {
    setIsOpen(searchParams.get("modal") === "true")
  }, [searchParams])

  // Sync active panel with URL path
  useEffect(() => {
    if (pathname === "/settings") setActivePanel("general")
    if (pathname === "/upgradeplan") setActivePanel("upgradePlan")
    if (pathname === "/addcard") setActivePanel("addCard")
  }, [pathname])

  // Validate a single field
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "fullName":
        return value.length < 2 ? "Full Name must be at least 2 characters" : 
               !validateName(value) ? "Invalid characters in name" : ""
      case "email":
        return value ? (validateEmail(value) ? "" : "Invalid Email") : "Email is required"
      default:
        return ""
    }
  }

  // Handle onBlur (when user finishes typing in a field)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors = {
      fullName: validateField("fullName", fullName),
      email: validateField("email", email),
    }
    setErrors(newErrors)

    // Check if form is valid
    const isValid = fullName.length >= 2 && email.length > 0 && Object.values(newErrors).every((error) => !error)
    setIsFormValid(isValid)

    if (isValid) {
      // Save to localStorage
      const userData = {
        fullName,
        username,
        email,
      }
      localStorage.setItem('userData', JSON.stringify(userData))
      
      // Show success message or feedback instead of closing modal
      // You could add a state for showing a success message
      setIsFormValid(false) // Reset form state
      setTimeout(() => setIsFormValid(true), 100) // Re-enable the button after a brief delay
      
      // Optional: Show a toast or success message
      alert('Changes saved successfully!') // Replace with your preferred notification method
    }
  }

  // Add this effect to update form validity when fields change
  useEffect(() => {
    const newErrors = {
      fullName: validateField("fullName", fullName),
      email: validateField("email", email),
    }
    const isValid = fullName.length >= 2 && email.length > 0 && Object.values(newErrors).every((error) => !error)
    setIsFormValid(isValid)
  }, [fullName, email])

  // Add this effect to load saved data
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData')
    if (savedUserData) {
      const { fullName, username, email } = JSON.parse(savedUserData)
      setFullName?.(fullName || '')
      setUsername?.(username || '')
      setEmail?.(email || '')
    }
  }, [setFullName, setUsername, setEmail])

  // Handle adding a card
  const handleAddCard = (newCardData: any) => {
    setCardData(newCardData)
    setCardAdded(true)
    setActivePanel("upgradePlan")
    router.replace("/upgradeplan?modal=true")
  }

  // Handle upgrading the plan
  const handleUpgradePlan = (plan: string) => {
    console.log(`Upgrading to ${plan} plan`)
    setCurrentPlan(plan)
    setIsOpen(false)
  }

  // Handle panel changes
  const handlePanelChange = (panel: ActivePanel) => {
    let newPath = ""
    switch (panel) {
      case "general":
        newPath = "/settings"
        break
      case "upgradePlan":
        newPath = "/upgradeplan"
        break
      case "addCard":
        newPath = "/addcard"
        break
      default:
        newPath = "/settings"
    }
    router.push(`${newPath}?modal=true`)
    setActivePanel(panel)
  }

  // Handle modal close and navigate back to dashboard
  const handleCloseModal = () => {
    setIsOpen(false)
    router.push("/")
  }

  // Render content based on active panel
  const renderContent = () => {
    switch (activePanel) {
      case "general":
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">Settings panel</h2>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  {previewUrl ? (
                    <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <button
                  onClick={handleThumbnailClick}
                  className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2"
                  aria-label="Change profile picture"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="submit" disabled={!isFormValid}>
                  Save Changes
                </Button>
              </div>
            </form>
          </>
        )
      case "upgradePlan":
        return (
          <PlanUpgradeDialog
            isCardAdded={cardAdded}
            onAddCard={() => handlePanelChange("addCard")}
            onUpgrade={handleUpgradePlan}
            currentPlan={currentPlan}
          />
        )
      case "addCard":
        return <AddCardDialog onAddCard={handleAddCard} initialData={cardData} />
      default:
        return null
    }
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] h-[600px] relative flex">
            {/* Left panel buttons */}
            <div className="w-64 bg-gray-100 p-4">
              <Button
                variant={activePanel === "general" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handlePanelChange("general")}
              >
                General
              </Button>
              <Button
                variant={activePanel === "upgradePlan" ? "default" : "ghost"}
                className="w-full justify-start mb-2"
                onClick={() => handlePanelChange("upgradePlan")}
              >
                Upgrade Plan
              </Button>
              <Button
                variant={activePanel === "addCard" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handlePanelChange("addCard")}
              >
                Add Card
              </Button>
            </div>

            {/* Right panel content */}
            <div className="flex-1 p-6 relative overflow-y-auto">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={24} />
              </button>
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

