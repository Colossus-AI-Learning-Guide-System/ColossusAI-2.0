"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Camera, Check } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { supabase } from "@/app/lib/utils/supabaseClient"
import { getStorageStats, toggleMemory, clearUserData } from "@/app/actions/storage"
import { deleteUserAccount } from "@/app/actions/user"
import { type StorageStats, STORAGE_LIMITS } from "@/app/types/storage"
import Image from "next/image"
import { Button } from "@/app/components/ui/button"
import { useProfile } from "@/app/hooks/use-profile"
import { useImageUpload } from "@/app/hooks/use-image-upload"

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
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free")
  const [saveLoading, setSaveLoading] = useState(false)
  
  // Update the profile hook usage
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError, 
    isAuthenticated,
    updateProfile, 
    fetchProfile 
  } = useProfile()
  
  // Use the image upload hook with profile refresh callback
  const imageUploadResult = useImageUpload(
    profile?.avatar_url || null, 
    { onSuccess: () => fetchProfile() }
  );
  
  const avatarUrl = imageUploadResult.previewUrl;
  const fileInputRef = imageUploadResult.fileInputRef;
  const isUploading = imageUploadResult.isUploading;
  const handlePhotoUpload = imageUploadResult.handleThumbnailClick;
  const handleFileChange = imageUploadResult.handleFileChange;

  // Combined loading state for UI
  const isLoading = profileLoading || isUploading || saveLoading;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  })

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
  })

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

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: "" })) // Clear error on change
  }

  const validateForm = () => {
    let isValid = true
    const errors = { fullName: "", email: "" }

    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
      isValid = false
    } else if (formData.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters"
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
      
      // Check if profile exists (user is authenticated)
      if (!profile) {
        showToast("Authentication required", "Please sign in to save changes.", "destructive")
        return
      }

      try {
        setSaveLoading(true)
        
        const updatedProfile = await updateProfile({
          full_name: formData.fullName,
          email: formData.email,
        })

        if (updatedProfile) {
          showToast("Profile updated", "Your profile information has been updated successfully.")
        } else {
          throw new Error("Failed to update profile")
        }
      } catch (error) {
        console.error("Error updating profile:", error)
        showToast("Update failed", "There was a problem updating your profile.", "destructive")
      } finally {
        setSaveLoading(false)
      }
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
    setSaveLoading(true)
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
      setSaveLoading(false)
    }
  }

  const handleClearData = async () => {
    setSaveLoading(true)
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
      setSaveLoading(false)
    }
  }

  // Create a wrapper for handleFileChange to show toast on success
  const handleFileChangeWithToast = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const result = await handleFileChange(e);
      if (result) {
        showToast("Photo uploaded", "Your profile photo has been updated successfully.");
      }
    } catch (error) {
      console.error("Error in handleFileChangeWithToast:", error);
      showToast("Upload failed", "There was a problem uploading your photo.", "destructive");
    }
  };

  const handleChangePassword = async () => {
    setSaveLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      showToast(
        "Password reset email sent", 
        "Check your email for a link to reset your password."
      )
    } catch (error) {
      console.error("Error sending password reset email:", error)
      showToast(
        "Failed to send reset email", 
        "Please try again or contact support.", 
        "destructive"
      )
    } finally {
      setSaveLoading(false)
    }
  }
  
  const handleLogoutAllDevices = async () => {
    setSaveLoading(true)
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
      
      // Redirect to sign-in page
      router.push('/signin')
    } catch (error) {
      console.error("Error logging out from all devices:", error)
      showToast(
        "Logout failed", 
        "Could not log out from all devices. Please try again.", 
        "destructive"
      )
      setSaveLoading(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }
    
    setSaveLoading(true)
    try {
      // Call server action to delete account
      const result = await deleteUserAccount()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete account")
      }
      
      // Sign out and redirect to signin page
      await supabase.auth.signOut()
      router.push('/signin')
    } catch (error) {
      console.error("Error deleting account:", error)
      showToast(
        "Account deletion failed", 
        "Please try again or contact support.", 
        "destructive"
      )
      setSaveLoading(false)
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
              <div className="space-y-8 pt-2 pb-6 px-6">
                {profileLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                ) : profileError ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="text-red-400 mb-2">Failed to load profile</div>
                    <p className="text-sm text-blue-300 mb-4">Please try refreshing the page</p>
                    <Button 
                      onClick={() => fetchProfile()}
                      disabled={isLoading}
                    >
                      Retry
                    </Button>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <div className="text-yellow-400 mb-2">Not signed in</div>
                    <p className="text-sm text-blue-300 mb-4">Please sign in to view and edit your profile</p>
                    <a href={`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}>
                      <Button>
                        Sign In
                      </Button>
                    </a>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-24 w-24">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="h-full w-full rounded-full object-cover"
                            onClick={handlePhotoUpload}
                          />
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center rounded-full bg-blue-700 text-3xl font-bold"
                            onClick={handlePhotoUpload}
                          >
                            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <button
                          onClick={handlePhotoUpload}
                          className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 shadow-lg hover:bg-blue-500"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChangeWithToast}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{formData.fullName || "User"}</h3>
                        <p className="text-blue-300">{formData.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-blue-200">
                          Full Name
                        </label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="mt-1 bg-blue-950/50 border-blue-800"
                          placeholder="Enter your full name"
                        />
                        {formErrors.fullName && <p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-blue-200">
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 bg-blue-950/50 border-blue-800"
                          placeholder="Enter your email address"
                        />
                        {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
                      </div>
                    </div>
                  </>
                )}
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
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl">Change password</h3>
                      <p className="text-sm text-blue-300">We'll send you an email with a link to reset your password</p>
                    </div>
                    <button 
                      className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200 disabled:opacity-70"
                      onClick={handleChangePassword}
                      disabled={isLoading || !formData.email}
                    >
                      {isLoading ? "Sending..." : "Change"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl">Log out from All Devices</h3>
                      <p className="text-sm text-blue-300">This will end all your active sessions and require re-login</p>
                    </div>
                    <button 
                      className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200 disabled:opacity-70"
                      onClick={handleLogoutAllDevices}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Logout"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl">Delete Account</h3>
                      <p className="text-sm text-red-300">This will permanently remove all your data and cannot be undone</p>
                    </div>
                    <button 
                      className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-70"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Delete"}
                    </button>
                  </div>
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
            ) : activeTab === "general" && profile ? (
              <button
                className={`w-full h-12 rounded-md bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleSaveChanges}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}


