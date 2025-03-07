"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { X, Camera, Check } from "lucide-react"
import { Switch } from "@/app/components/ui/switch"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Progress } from "@/app/components/ui/progress"

type SettingsTab = "general" | "upgrade" | "memory" | "security"

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [storageUsed, setStorageUsed] = useState(45) // percentage
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    username: "johndoe",
    email: "john@example.com",
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

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-xl">
        {/* Navigation sidebar */}
        <div className="w-64 border-r border-blue-700/50 p-4">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`rounded-lg p-4 text-left transition ${
                activeTab === "general" ? "bg-gradient-to-r from-blue-800 to-blue-600" : "hover:bg-blue-800/50"
              }`}
            >
              Genaral
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
                      <span>No image</span>
                    </div>
                    <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-black">
                      <Camera className="h-4 w-4" />
                    </button>
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
                  </div>
                  <div>
                    <label className="mb-2 block">Username</label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="h-12 bg-gradient-to-r from-blue-700 to-purple-600 border-none text-white placeholder-white/70"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block">Email</label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-12 bg-gradient-to-r from-blue-700 to-purple-600 border-none text-white placeholder-white/70"
                    />
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
                  <div className="rounded-lg border-2 border-white/30 bg-blue-950/50 p-4 flex flex-col">
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
                  <div className="rounded-lg border-2 border-purple-500 bg-blue-950/50 p-4 flex flex-col relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                    <h3 className="text-xl font-bold text-center mb-2">Pro</h3>
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
                  <div className="rounded-lg border-2 border-white/30 bg-blue-950/50 p-4 flex flex-col">
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
                  <Switch
                    checked={memoryEnabled}
                    onCheckedChange={setMemoryEnabled}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                <p className="text-sm">
                  Colossus.AI will save your Added file data upto your Plan storage
                  <br />
                  By turn off the Memory will not save the uploading file data.
                </p>

                <div className="space-y-2">
                  <h3 className="text-lg">Your current Plan storage</h3>
                  <div className="relative h-8 w-full overflow-hidden rounded-lg border border-white/20">
                    <Progress
                      value={storageUsed}
                      className="h-full bg-blue-900"
                      indicatorClassName="bg-gradient-to-r from-blue-600 to-purple-600"
                    />
                  </div>
                  <div className="text-right">5.5 MB Free</div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Clear the uploaded Data</span>
                  <Button variant="outline" className="bg-white text-black hover:bg-gray-200">
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Change passsword</h3>
                  <Button variant="outline" className="bg-white text-black hover:bg-gray-200">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Log out from All Devices</h3>
                  <Button variant="outline" className="bg-white text-black hover:bg-gray-200">
                    Logout
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Delete Accounts</h3>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-blue-700/50 p-6">
            {activeTab === "upgrade" ? (
              <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                Proceed to Payment
              </Button>
            ) : (
              <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

