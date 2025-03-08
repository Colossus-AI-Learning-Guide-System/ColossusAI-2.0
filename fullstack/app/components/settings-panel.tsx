"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Camera, Check } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { supabase } from "../lib/utils/supabaseClient"
import { getStorageStats, toggleMemory, clearUserData } from "@/app/actions/storage"
import { type StorageStats, STORAGE_LIMITS } from "@/app/types/storage"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"

type SettingsTab = "general" | "upgrade" | "memory" | "security"
export type PlanType = "free" | "pro" | "enterprise" | null

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  userPermissions?: string[]
  userSubscription?: string
  featureFlags?: {
    securitySettings: boolean
    memoryManagement: boolean
  }
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
  defaultPanel?: string
}

// Update the default props for featureFlags
export function SettingsPanel({
  isOpen,
  onClose,
  userPermissions = [],
  userSubscription = "free",
  featureFlags = { securitySettings: true, memoryManagement: true }, // Ensure memoryManagement is true by default
  fullName,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  cardData,
  setCardData,
  currentPlan,
  setCurrentPlan,
  cardAdded,
  setCardAdded,
  defaultPanel,
}: SettingsPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [storageUsed, setStorageUsed] = useState(45) // percentage
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
  })

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    username: "",
    email: "",
  })

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [storageStats, setStorageStats] = useState<StorageStats>({
    usedStorage: 0,
    maxStorage: STORAGE_LIMITS.free,
    isMemoryEnabled: false,
  })

  // Update URL when tab changes
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("settings", activeTab)
      router.push(`?${params.toString()}`, { scroll: false })
    }
  }, [activeTab, isOpen, router, searchParams])

  // Set active tab from URL when opening
  useEffect(() => {
    if (isOpen) {
      const tab = searchParams.get("settings")
      if (tab && ["general", "upgrade", "memory", "security"].includes(tab)) {
        setActiveTab(tab as SettingsTab)
      } else {
        setActiveTab("general")
      }
    }
  }, [isOpen, searchParams])

  // Fetch user data from Supabase
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (data) {
            setFormData({
              fullName: data.full_name || "",
              username: data.username || "",
              email: data.email || user.email || "",
            })
          } else {
            // If no profile exists yet, just use the email from auth
            setFormData((prev) => ({
              ...prev,
              email: user.email || "",
            }))
          }
        } else {
          // For demo purposes, set some placeholder data
          setFormData({
            fullName: "Demo User",
            username: "demouser",
            email: "demo@example.com",
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // For demo purposes, set some placeholder data
        setFormData({
          fullName: "Demo User",
          username: "demouser",
          email: "demo@example.com",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen && activeTab === "general") {
      fetchUserData()
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    async function fetchAvatar() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

          if (data?.avatar_url) {
            setAvatarUrl(data.avatar_url)
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error)
      }
    }

    if (isOpen && activeTab === "general") {
      fetchAvatar()
    }
  }, [isOpen, activeTab])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const errors = { fullName: "", username: "", email: "" }

    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
      isValid = false
    } else if (formData.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
      isValid = false
    }

    // Validate username
    if (!formData.username.trim()) {
      errors.username = "Username is required"
      isValid = false
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
      isValid = false
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores"
      isValid = false
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Email is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Simple toast function
  const showToast = (title: string, description?: string, variant?: "default" | "destructive") => {
    console.log(`[Toast - ${variant || "default"}] ${title}${description ? ": " + description : ""}`)

    // Create a temporary toast element
    const toast = document.createElement("div")
    toast.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      variant === "destructive" ? "bg-red-600" : "bg-green-600"
    } text-white max-w-md transition-all duration-300 transform translate-y-2 opacity-0`

    const titleEl = document.createElement("h3")
    titleEl.className = "font-bold"
    titleEl.textContent = title
    toast.appendChild(titleEl)

    if (description) {
      const descEl = document.createElement("p")
      descEl.className = "text-sm mt-1"
      descEl.textContent = description
      toast.appendChild(descEl)
    }

    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0")
    }, 10)

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0")
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  const handleSaveChanges = async () => {
    if (activeTab === "general") {
      if (!validateForm()) return

      try {
        setIsLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            full_name: formData.fullName,
            username: formData.username,
            email: formData.email,
            updated_at: new Date().toISOString(),
          })

          if (error) throw error

          showToast("Profile updated", "Your profile information has been updated successfully.")
        } else {
          // For demo purposes, show success anyway
          showToast("Demo mode", "In a real app, your profile would be updated now.")
        }
      } catch (error) {
        console.error("Error updating profile:", error)
        showToast("Update failed", "There was a problem updating your profile.", "destructive")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePhotoUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // First, upload to local storage
        const reader = new FileReader()
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string
          setAvatarUrl(dataUrl) // Update UI immediately

          // Then upload to Supabase
          const fileExt = file.name.split(".").pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file)

          if (uploadError) throw uploadError

          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fileName)

          const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user.id)

          if (updateError) throw updateError

          setAvatarUrl(publicUrl)
          showToast("Photo uploaded", "Your profile photo has been updated successfully.")
        }

        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      showToast("Upload failed", "There was a problem uploading your photo.", "destructive")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function fetchStorageStats() {
      if (activeTab === "memory") {
        const stats = await getStorageStats()
        setStorageStats(stats)
      }
    }

    fetchStorageStats()
  }, [activeTab])

  const handleMemoryToggle = async (enabled: boolean) => {
    setIsLoading(true)
    try {
      const success = await toggleMemory(enabled)
      if (success) {
        setStorageStats((prev) => ({ ...prev, isMemoryEnabled: enabled }))
        showToast("Memory settings updated", `File storage has been ${enabled ? "enabled" : "disabled"}.`)
      }
    } catch (error) {
      console.error("Error toggling memory:", error)
      showToast("Update failed", "Could not update memory settings.", "destructive")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearData = async () => {
    setIsLoading(true)
    try {
      const success = await clearUserData()
      if (success) {
        setStorageStats((prev) => ({ ...prev, usedStorage: 0 }))
        showToast("Data cleared", "All uploaded files have been removed.")
      }
    } catch (error) {
      console.error("Error clearing data:", error)
      showToast("Clear failed", "Could not clear uploaded data.", "destructive")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

        return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-4xl h-[600px] overflow-hidden rounded-lg bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-xl">
        {/* Navigation sidebar */}
        <div className="w-64 border-r border-blue-700/50 p-4">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`rounded-lg p-4 text-left transition ${
                activeTab === "general" ? "bg-gradient-to-r from-blue-800 to-blue-600" : "hover:bg-blue-800/50"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("upgrade")}
              className={`rounded-lg p-4 text-left transition ${
                activeTab === "upgrade" ? "bg-gradient-to-r from-blue-800 to-blue-600" : "hover:bg-blue-800/50"
              }`}
            >
              Upgrade Plan
            </button>
            <button
              onClick={() => setActiveTab("memory")}
              className={`rounded-lg p-4 text-left transition ${
                activeTab === "memory" ? "bg-gradient-to-r from-blue-800 to-blue-600" : "hover:bg-blue-800/50"
              }`}
            >
              Memory
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`rounded-lg p-4 text-left transition ${
                activeTab === "security" ? "bg-gradient-to-r from-blue-800 to-blue-600" : "hover:bg-blue-800/50"
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-blue-700/50 p-6">
            <h2 className="text-2xl font-bold">
              {activeTab === "general" && "Settings"}
              {activeTab === "upgrade" && "Change your Plan"}
              {activeTab === "memory" && "Data Controll"}
              {activeTab === "security" && "Security"}
            </h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-blue-700/50">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeTab === "general" && (
              <div className="flex flex-col space-y-6">
                <div className="flex justify-center">
              <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl || "/placeholder.svg"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>No image</span>
                  )}
                </div>
                <button
                      onClick={handlePhotoUpload}
                      className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-black"
                    >
                      <Camera className="h-4 w-4" />
                </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
              </div>
            </div>

                <div className="space-y-4">
              <div>
                    <label className="mb-2 block">Full Name</label>
                <Input
                  name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="h-12 bg-gradient-to-r from-blue-700 to-purple-600 border-none text-white placeholder-white/70"
                    />
                    {formErrors.fullName && <p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>}
              </div>
              <div>
                    <label className="mb-2 block">Username</label>
                <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="h-12 bg-gradient-to-r from-blue-700 to-purple-600 border-none text-white placeholder-white/70"
                    />
                    {formErrors.username && <p className="mt-1 text-sm text-red-400">{formErrors.username}</p>}
              </div>
              <div>
                    <label className="mb-2 block">Email</label>
                <Input
                  name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12 bg-gradient-to-r from-blue-700 to-purple-600 border-none text-white placeholder-white/70"
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "upgrade" && (
              <div className="flex flex-col space-y-6">
                <div>
                  <p className="text-lg">Current Plan - FREE</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div
                    className={`rounded-lg border-2 ${selectedPlan === "free" ? "border-white" : "border-white/30"} bg-blue-950/50 p-4 flex flex-col cursor-pointer transition-all`}
                    onClick={() => setSelectedPlan("free")}
                  >
                    <h3 className="text-xl font-bold text-center mb-2">Free</h3>
                    <div className="text-center border-b border-white/20 pb-2 mb-4">
                      <span className="text-3xl font-bold">$0.00</span>
                      <p className="text-sm text-white/70">monthly</p>
                    </div>
                    <ul className="space-y-2 flex-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Limited Access
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        2- Documents Limit
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Upto 10MB Storage
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        RoadMap Genaration
                      </li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div
                    className={`rounded-lg border-2 ${selectedPlan === "pro" ? "border-white" : "border-purple-500"} bg-blue-950/50 p-4 flex flex-col relative cursor-pointer transition-all`}
                    onClick={() => setSelectedPlan("pro")}
                  >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                      Most Popular
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2 mt-2">Pro</h3>
                    <div className="text-center border-b border-white/20 pb-2 mb-4">
                      <span className="text-3xl font-bold">$9.99</span>
                      <p className="text-sm text-white/70">monthly</p>
                    </div>
                    <ul className="space-y-2 flex-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Additional Access
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        10- Documents Limit
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Upto 100 MB Storage
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Document History
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        RoadMap Generation
                      </li>
                    </ul>
                  </div>

                  {/* Enterprise Plan */}
                  <div
                    className={`rounded-lg border-2 ${selectedPlan === "enterprise" ? "border-white" : "border-white/30"} bg-blue-950/50 p-4 flex flex-col cursor-pointer transition-all`}
                    onClick={() => setSelectedPlan("enterprise")}
                  >
                    <h3 className="text-xl font-bold text-center mb-2">Enterprise</h3>
                    <div className="text-center border-b border-white/20 pb-2 mb-4">
                      <span className="text-3xl font-bold">$14.99</span>
                      <p className="text-sm text-white/70">monthly</p>
                    </div>
                    <ul className="space-y-2 flex-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Additional Access
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        30- Documents Limit
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Upto 500 MB Storage
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        Document History
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-purple-400" />
                        RoadMap Generation
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Memory</h3>
                  <div
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[state=checked]:bg-green-500 cursor-pointer"
                    onClick={() => handleMemoryToggle(!storageStats.isMemoryEnabled)}
                  >
                    <span
                      className={`pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        storageStats.isMemoryEnabled ? "translate-x-[22px]" : ""
                      }`}
                    />
                  </div>
                </div>

                <p className="text-sm">
                  Colossus.AI will save your Added file data up to your Plan storage
                  <br />
                  By turning off the Memory, new file uploads will not be saved.
                </p>

                <div className="space-y-2">
                  <h3 className="text-lg">Your current Plan storage</h3>
                  <div className="relative h-8 w-full overflow-hidden rounded-lg border border-white/20">
                    <div className="h-full w-full bg-blue-900">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                        style={{ width: `${(storageStats.usedStorage / storageStats.maxStorage) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{(storageStats.usedStorage / (1024 * 1024)).toFixed(1)}MB used</span>
                    <span>{(storageStats.maxStorage / (1024 * 1024)).toFixed(0)}MB total</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Clear the uploaded Data</span>
              <Button
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={handleClearData}
                    disabled={isLoading || storageStats.usedStorage === 0}
                  >
                    {isLoading ? "Clearing..." : "Clear"}
              </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Change passsword</h3>
                  <button className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200">Change</button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Log out from All Devices</h3>
                  <button className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200">Logout</button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Delete Accounts</h3>
                  <button className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">Delete</button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-blue-700/50 p-6">
            {activeTab === "upgrade" ? (
              <button
                className={`w-full h-12 rounded-md ${
                  ["pro", "enterprise"].includes(selectedPlan as string)
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    : "bg-gray-500 cursor-not-allowed"
                } text-white`}
                disabled={!["pro", "enterprise"].includes(selectedPlan as string)}
                onClick={() => {
                  if (["pro", "enterprise"].includes(selectedPlan as string)) {
                    // Handle payment process
                    showToast("Proceeding to payment", `You selected the ${selectedPlan?.toUpperCase()} plan.`)
                  }
                }}
              >
                Proceed to Payment
              </button>
            ) : (
              <button
                className={`w-full h-12 rounded-md bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

