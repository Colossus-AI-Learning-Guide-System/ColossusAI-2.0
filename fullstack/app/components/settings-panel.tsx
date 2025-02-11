"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { X } from "lucide-react"
import { useImageUpload } from "../hooks/use-image-upload" // Updated import statement
import { PlanUpgradeDialog } from "../components/plan-upgrade-dialog"

const validateName = (name: string) => {
    return /^[A-Za-z\s]+$/.test(name)
  }
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  export function SettingsPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [errors, setErrors] = useState({
      firstName: "",
      lastName: "",
      email: "",
    })
    const [isFormValid, setIsFormValid] = useState(false)
  
    const openDialog = () => setIsOpen(true)
    const closeDialog = () => setIsOpen(false)
  
    useEffect(() => {
      const newErrors = {
        firstName: validateName(firstName) ? "" : "Invalid First Name",
        lastName: validateName(lastName) ? "" : "Invalid Last Name",
        email: validateEmail(email) ? "" : "Invalid Email",
      }
      setErrors(newErrors)
  
      setIsFormValid(validateName(firstName) && validateName(lastName) && validateEmail(email) && username.length > 0)
    }, [firstName, lastName, email, username])
  
    return (
      <div>
        <Button onClick={openDialog}>Edit Profile</Button>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <button
                onClick={closeDialog}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={24} />
              </button>
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
              <form className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
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
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="pt-4">
                  <PlanUpgradeDialog isDisabled={!isFormValid} />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={closeDialog} disabled={!isFormValid}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  