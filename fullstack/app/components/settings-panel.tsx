"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  X,
  Camera,
  Check,
  User,
  CreditCard,
  Database,
  Shield,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { supabase } from "@/app/lib/utils/supabaseClient";
import {
  getStorageStats,
  toggleMemory,
  clearUserData,
} from "@/app/actions/storage";
import { deleteUserAccount } from "@/app/actions/user";
import { type StorageStats, STORAGE_LIMITS } from "@/app/types/storage";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { useProfile } from "@/app/hooks/use-profile";
import { useImageUpload } from "@/app/hooks/use-image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useTheme } from "next-themes";

type SettingsTab = "general" | "upgrade" | "memory" | "security";
export type PlanType = "free" | "pro" | "enterprise" | null;

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userPermissions?: string[];
  userSubscription?: string;
  featureFlags?: {
    securitySettings: boolean;
    memoryManagement: boolean;
  };
  fullName?: string;
  setFullName?: (value: string) => void;
  email?: string;
  setEmail?: (value: string) => void;
  cardData?: any;
  setCardData?: (value: any) => void;
  currentPlan?: string;
  setCurrentPlan?: (value: string) => void;
  cardAdded?: boolean;
  setCardAdded?: (value: boolean) => void;
  defaultPanel?: string;
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [storageUsed, setStorageUsed] = useState(45); // percentage
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free");
  const [saveLoading, setSaveLoading] = useState(false);

  // Update the profile hook usage
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    isAuthenticated,
    updateProfile,
    fetchProfile,
  } = useProfile();

  // Use the image upload hook with profile refresh callback
  const imageUploadResult = useImageUpload(
    null, // Don't rely on profile.avatar_url
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
  });

  const [formErrors, setFormErrors] = useState({
    fullName: "",
    email: "",
  });

  const [storageStats, setStorageStats] = useState<StorageStats>({
    usedStorage: 0,
    maxStorage: STORAGE_LIMITS.free,
    isMemoryEnabled: false,
  });

  // Get the current theme
  const { theme, setTheme } = useTheme();
  const isDarkTheme = theme === "dark";

  // Add a state to track mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  // Add a useEffect to detect mobile screens
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener("resize", checkMobileView);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (isOpen && searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("settings", activeTab);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, isOpen, router, searchParams]);

  // Set active tab from URL when opening
  useEffect(() => {
    if (isOpen && searchParams) {
      const tab = searchParams.get("settings");
      if (tab && ["general", "upgrade", "memory", "security"].includes(tab)) {
        setActiveTab(tab as SettingsTab);
      } else {
        setActiveTab("general");
      }
    }
  }, [isOpen, searchParams]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" })); // Clear error on change
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { fullName: "", email: "" };

    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    } else if (formData.fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
      isValid = false;
    } else {
      // Check if full name contains at least 2 words (first and last name)
      const nameWords = formData.fullName
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      if (nameWords.length < 2) {
        errors.fullName = "Please enter both first and last name";
        isValid = false;
      }
    }

    // Email validation removed as it's now display-only

    setFormErrors(errors);
    return isValid;
  };

  // Simple toast function
  const showToast = (
    title: string,
    description?: string,
    variant?: "default" | "destructive"
  ) => {
    console.log(
      `[Toast - ${variant || "default"}] ${title}${
        description ? ": " + description : ""
      }`
    );

    // Create a temporary toast element
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      variant === "destructive" ? "bg-red-600" : "bg-green-600"
    } text-white max-w-md transition-all duration-300 transform translate-y-2 opacity-0`;

    const titleEl = document.createElement("h3");
    titleEl.className = "font-bold";
    titleEl.textContent = title;
    toast.appendChild(titleEl);

    if (description) {
      const descEl = document.createElement("p");
      descEl.className = "text-sm mt-1";
      descEl.textContent = description;
      toast.appendChild(descEl);
    }

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove("translate-y-2", "opacity-0");
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("translate-y-2", "opacity-0");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const handleSaveChanges = async () => {
    if (activeTab === "general") {
      if (!validateForm()) return;

      // Check if profile exists (user is authenticated)
      if (!profile) {
        showToast(
          "Authentication required",
          "Please sign in to save changes.",
          "destructive"
        );
        return;
      }

      try {
        setSaveLoading(true);

        const updatedProfile = await updateProfile({
          full_name: formData.fullName,
          // email field removed from update as it's now display-only
        });

        if (updatedProfile) {
          showToast(
            "Profile updated",
            "Your profile information has been updated successfully."
          );
        } else {
          throw new Error("Failed to update profile");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        showToast(
          "Update failed",
          "There was a problem updating your profile.",
          "destructive"
        );
      } finally {
        setSaveLoading(false);
      }
    }
  };

  useEffect(() => {
    async function fetchStorageStats() {
      if (activeTab === "memory") {
        const stats = await getStorageStats();
        setStorageStats(stats);
      }
    }

    fetchStorageStats();
  }, [activeTab]);

  const handleMemoryToggle = async (enabled: boolean) => {
    setSaveLoading(true);
    try {
      const success = await toggleMemory(enabled);
      if (success) {
        setStorageStats((prev) => ({ ...prev, isMemoryEnabled: enabled }));
        showToast(
          "Memory settings updated",
          `File storage has been ${enabled ? "enabled" : "disabled"}.`
        );
      }
    } catch (error) {
      console.error("Error toggling memory:", error);
      showToast(
        "Update failed",
        "Could not update memory settings.",
        "destructive"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClearData = async () => {
    setSaveLoading(true);
    try {
      const success = await clearUserData();
      if (success) {
        setStorageStats((prev) => ({ ...prev, usedStorage: 0 }));
        showToast("Data cleared", "All uploaded files have been removed.");
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      showToast(
        "Clear failed",
        "Could not clear uploaded data.",
        "destructive"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Create a wrapper for handleFileChange to show toast on success
  const handleFileChangeWithToast = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const result = await handleFileChange(e);
      if (result) {
        showToast(
          "Photo uploaded",
          "Your profile photo has been updated successfully."
        );
      }
    } catch (error) {
      console.error("Error in handleFileChangeWithToast:", error);
      // Check if error is related to avatar_url column
      const errorMessage = error instanceof Error ? error.message : "";
      if (errorMessage.includes("avatar_url")) {
        // The profile was updated successfully but the avatar_url column doesn't exist
        showToast(
          "Photo uploaded",
          "Your profile photo has been updated successfully."
        );
      } else {
        showToast(
          "Upload failed",
          "There was a problem uploading your photo.",
          "destructive"
        );
      }
    }
  };

  const handleChangePassword = async () => {
    // Redirect to forget password page
    router.push("/forgot-password");
  };

  const handleLogoutAllDevices = async () => {
    setSaveLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      // Redirect to sign-in page
      router.push("/signin");
    } catch (error) {
      console.error("Error logging out from all devices:", error);
      showToast(
        "Logout failed",
        "Could not log out from all devices. Please try again.",
        "destructive"
      );
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setSaveLoading(true);
    try {
      // Call server action to delete account
      const result = await deleteUserAccount();

      if (!result.success) {
        throw new Error(result.error || "Failed to delete account");
      }

      // Sign out and redirect to signin page
      await supabase.auth.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast(
        "Account deletion failed",
        "Please try again or contact support.",
        "destructive"
      );
      setSaveLoading(false);
    }
  };

  // Add this useEffect to handle body class
  useEffect(() => {
    if (isOpen && isMobileView) {
      document.body.classList.add("settings-panel-open");
    } else {
      document.body.classList.remove("settings-panel-open");
    }

    return () => {
      document.body.classList.remove("settings-panel-open");
    };
  }, [isOpen, isMobileView]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        // Close when clicking outside the modal (only on desktop)
        if (!isMobileView && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`flex ${
          isMobileView ? "flex-col w-full h-full" : "w-full max-w-4xl h-[600px]"
        } overflow-hidden rounded-lg shadow-xl ${
          isDarkTheme
            ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
            : "bg-gradient-to-br from-blue-900 to-blue-800 text-white"
        }`}
      >
        {/* Close button for mobile view */}
        {isMobileView && (
          <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
            <h2 className="text-lg font-bold">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Navigation sidebar - conditional styling for mobile */}
        <div
          className={`${
            isMobileView ? "w-full border-b" : "w-64 border-r"
          } p-4 ${isDarkTheme ? "border-gray-700/50" : "border-blue-700/50"}`}
        >
          <nav
            className={`flex ${
              isMobileView
                ? "flex-row overflow-x-auto gap-2 pb-2"
                : "flex-col space-y-2"
            }`}
          >
            <button
              onClick={() => setActiveTab("general")}
              className={`${
                isMobileView ? "flex-shrink-0" : ""
              } rounded-lg p-4 text-left transition flex items-center ${
                activeTab === "general"
                  ? isDarkTheme
                    ? "bg-gradient-to-r from-gray-800 to-gray-700"
                    : "bg-gradient-to-r from-blue-800 to-blue-600"
                  : isDarkTheme
                  ? "hover:bg-gray-800/50"
                  : "hover:bg-blue-800/50"
              }`}
            >
              <User className="h-5 w-5 mr-3" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab("upgrade")}
              className={`${
                isMobileView ? "flex-shrink-0" : ""
              } rounded-lg p-4 text-left transition flex items-center ${
                activeTab === "upgrade"
                  ? isDarkTheme
                    ? "bg-gradient-to-r from-gray-800 to-gray-700"
                    : "bg-gradient-to-r from-blue-800 to-blue-600"
                  : isDarkTheme
                  ? "hover:bg-gray-800/50"
                  : "hover:bg-blue-800/50"
              }`}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              <span>Upgrade</span>
            </button>

            {featureFlags?.memoryManagement && (
              <button
                onClick={() => setActiveTab("memory")}
                className={`${
                  isMobileView ? "flex-shrink-0" : ""
                } rounded-lg p-4 text-left transition flex items-center ${
                  activeTab === "memory"
                    ? isDarkTheme
                      ? "bg-gradient-to-r from-gray-800 to-gray-700"
                      : "bg-gradient-to-r from-blue-800 to-blue-600"
                    : isDarkTheme
                    ? "hover:bg-gray-800/50"
                    : "hover:bg-blue-800/50"
                }`}
              >
                <Database className="h-5 w-5 mr-3" />
                <span>Memory</span>
              </button>
            )}

            {featureFlags?.securitySettings && (
              <button
                onClick={() => setActiveTab("security")}
                className={`${
                  isMobileView ? "flex-shrink-0" : ""
                } rounded-lg p-4 text-left transition flex items-center ${
                  activeTab === "security"
                    ? isDarkTheme
                      ? "bg-gradient-to-r from-gray-800 to-gray-700"
                      : "bg-gradient-to-r from-blue-800 to-blue-600"
                    : isDarkTheme
                    ? "hover:bg-gray-800/50"
                    : "hover:bg-blue-800/50"
                }`}
              >
                <Shield className="h-5 w-5 mr-3" />
                <span>Security</span>
              </button>
            )}

            {/* Only show close button in desktop view */}
            {!isMobileView && (
              <button
                onClick={onClose}
                className="rounded-lg p-4 text-left transition flex items-center hover:bg-red-800/50 mt-auto"
              >
                <X className="h-5 w-5 mr-3" />
                Close
              </button>
            )}
          </nav>
        </div>

        {/* Main content area - conditional styling for mobile */}
        <div
          className={`${
            isMobileView ? "w-full" : "flex-1"
          } p-6 overflow-y-auto`}
        >
          <div
            className={`flex items-center justify-between ${
              isMobileView ? "pb-4" : "p-6"
            } ${
              isDarkTheme
                ? "border-b border-gray-700/50"
                : "border-b border-blue-700/50"
            }`}
          >
            <h2 className="text-xl font-semibold">
              {activeTab === "general" && "Profile Settings"}
              {activeTab === "upgrade" && "Upgrade Plan"}
              {activeTab === "memory" && "Memory Management"}
              {activeTab === "security" && "Security Settings"}
            </h2>
            {!isMobileView && (
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>

          <div
            className={`${isMobileView ? "p-4" : "p-6"} h-full overflow-y-auto`}
          >
            {activeTab === "general" && (
              <div className="space-y-6">
                <div
                  className={`flex ${
                    isMobileView ? "flex-col items-center" : "items-center"
                  } gap-6`}
                >
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}

                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-full object-cover"
                        onClick={handlePhotoUpload}
                        onError={(e) => {
                          // Debug information
                          console.error("Failed to load image:", avatarUrl);

                          // If image fails to load, replace with placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.closest(".relative");
                          if (parent) {
                            const div = document.createElement("div");
                            div.className =
                              "flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold";
                            div.innerHTML = formData.fullName
                              ? formData.fullName.charAt(0).toUpperCase()
                              : "U";
                            div.onclick = () => handlePhotoUpload();
                            parent.appendChild(div);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold"
                        onClick={handlePhotoUpload}
                      >
                        {formData.fullName
                          ? formData.fullName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${
                      isMobileView ? "text-center w-full" : "flex-1"
                    }`}
                  >
                    <h3 className="text-lg font-medium mb-1">
                      Profile Picture
                    </h3>
                    <p className="text-sm text-white/70 mb-3">
                      Upload a profile photo to personalize your account
                    </p>
                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={isLoading}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                        isDarkTheme
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-700 hover:bg-blue-800"
                      } text-white transition-all ${
                        isLoading ? "opacity-70" : ""
                      } ${isMobileView ? "w-full" : ""}`}
                    >
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium mb-1"
                    >
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className={`w-full rounded-lg border ${
                        isDarkTheme
                          ? "bg-gray-800 border-gray-700"
                          : "bg-blue-800/50 border-blue-700"
                      } 
                        text-white placeholder-white/50 ${
                          isMobileView ? "text-base p-3" : ""
                        }`}
                      disabled={isLoading}
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-400">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled={true} // Email is read-only
                      className={`w-full rounded-lg border ${
                        isDarkTheme
                          ? "bg-gray-800/50 border-gray-700"
                          : "bg-blue-800/30 border-blue-700"
                      } 
                        text-white/80 ${isMobileView ? "text-base p-3" : ""}`}
                    />
                    <p className="mt-1 text-xs text-white/50">
                      Email cannot be changed
                    </p>
                  </div>

                  {isMobileView ? (
                    // Mobile layout for save button - fixed at bottom
                    <div className="pt-6 pb-2">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className={`w-full py-3 text-base ${
                          isDarkTheme
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white rounded-lg transition-all`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  ) : (
                    // Desktop layout - normal button
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                        className={`py-2 px-4 ${
                          isDarkTheme
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white rounded-lg transition-all`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "upgrade" && (
              <div className="flex flex-col space-y-6">
                <div>
                  <p className="text-lg font-medium mb-2">
                    Current Plan - FREE
                  </p>
                  <p className="text-sm text-white/70 mb-4">
                    Choose a plan that suits your needs.
                  </p>
                </div>

                <div
                  className={`grid ${
                    isMobileView ? "grid-cols-1 gap-8" : "grid-cols-1 gap-8"
                  }`}
                >
                  {/* Free Plan */}
                  <div
                    className={`rounded-lg border-2 ${
                      selectedPlan === "free"
                        ? "border-white"
                        : "border-white/30"
                    } bg-blue-950/50 p-8 flex flex-col cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/30`}
                    onClick={() => setSelectedPlan("free")}
                  >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20">
                      <h3 className="text-3xl font-bold">Free</h3>
                      <div className="text-right">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-2xl">.00</span>
                        <p className="text-sm text-white/70 mt-1">monthly</p>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-6">
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Limited Access</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">2 Documents Limit</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Up to 10MB Storage</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">RoadMap Generation</span>
                      </li>
                    </ul>
                    <button
                      className={`rounded-md w-full py-4 mt-auto font-medium ${
                        selectedPlan === "free"
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-700"
                      } text-white transition-all text-xl`}
                      disabled={selectedPlan === "free"}
                    >
                      Current Plan
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div
                    className={`rounded-lg border-2 ${
                      selectedPlan === "pro"
                        ? "border-white"
                        : "border-purple-500"
                    } bg-blue-950/50 p-8 flex flex-col relative cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-900/30`}
                    onClick={() => setSelectedPlan("pro")}
                  >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 px-6 py-2 rounded-full text-lg font-bold whitespace-nowrap">
                      Most Popular
                    </div>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20 mt-2">
                      <h3 className="text-3xl font-bold">Pro</h3>
                      <div className="text-right">
                        <span className="text-4xl font-bold">$9</span>
                        <span className="text-2xl">.99</span>
                        <p className="text-sm text-white/70 mt-1">monthly</p>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-6">
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Additional Access</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">10 Documents Limit</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Up to 100MB Storage</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Document History</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">RoadMap Generation</span>
                      </li>
                    </ul>
                    <button
                      className={`rounded-md w-full py-4 mt-auto font-medium ${
                        isDarkTheme
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      } text-white transition-all text-xl`}
                    >
                      Upgrade Now
                    </button>
                  </div>

                  {/* Enterprise Plan */}
                  <div
                    className={`rounded-lg border-2 ${
                      selectedPlan === "enterprise"
                        ? "border-white"
                        : "border-white/30"
                    } bg-blue-950/50 p-8 flex flex-col cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/30`}
                    onClick={() => setSelectedPlan("enterprise")}
                  >
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/20">
                      <h3 className="text-3xl font-bold">Enterprise</h3>
                      <div className="text-right">
                        <span className="text-4xl font-bold">$14</span>
                        <span className="text-2xl">.99</span>
                        <p className="text-sm text-white/70 mt-1">monthly</p>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-6">
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Additional Access</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">30 Documents Limit</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Up to 500MB Storage</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Document History</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">RoadMap Generation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-6 w-6 mr-3 text-purple-400 shrink-0 mt-0.5" />
                        <span className="text-lg">Priority Support</span>
                      </li>
                    </ul>
                    <button
                      className={`rounded-md w-full py-4 mt-auto font-medium ${
                        isDarkTheme
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      } text-white transition-all text-xl`}
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>

                {isMobileView ? (
                  <button
                    className={`w-full h-12 rounded-md mt-6 ${
                      ["pro", "enterprise"].includes(selectedPlan as string)
                        ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        : "bg-gray-500 cursor-not-allowed"
                    } text-white font-medium`}
                    disabled={
                      !["pro", "enterprise"].includes(selectedPlan as string)
                    }
                    onClick={() => {
                      if (
                        ["pro", "enterprise"].includes(selectedPlan as string)
                      ) {
                        // Handle payment process
                        showToast(
                          "Proceeding to payment",
                          `You selected the ${selectedPlan?.toUpperCase()} plan.`
                        );
                      }
                    }}
                  >
                    {selectedPlan === "free"
                      ? "Current Plan"
                      : "Proceed to Payment"}
                  </button>
                ) : null}
              </div>
            )}

            {activeTab === "memory" && (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">Memory</h3>
                  <div
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 data-[state=checked]:bg-green-500 cursor-pointer"
                    onClick={() =>
                      handleMemoryToggle(!storageStats.isMemoryEnabled)
                    }
                  >
                    <span
                      className={`pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                        storageStats.isMemoryEnabled ? "translate-x-[22px]" : ""
                      }`}
                    />
                  </div>
                </div>

                <p className="text-sm">
                  Colossus.AI will save your Added file data up to your Plan
                  storage
                  <br />
                  By turning off the Memory, new file uploads will not be saved.
                </p>

                <div className="space-y-2">
                  <h3 className="text-lg">Your current Plan storage</h3>
                  <div className="relative h-8 w-full overflow-hidden rounded-lg border border-white/20">
                    <div className="h-full w-full bg-blue-900">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                        style={{
                          width: `${
                            (storageStats.usedStorage /
                              storageStats.maxStorage) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {(storageStats.usedStorage / (1024 * 1024)).toFixed(1)}MB
                      used
                    </span>
                    <span>
                      {(storageStats.maxStorage / (1024 * 1024)).toFixed(0)}MB
                      total
                    </span>
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
                      <h3 className="text-xl">Theme</h3>
                      <p
                        className={`text-sm ${
                          isDarkTheme ? "text-gray-300" : "text-blue-300"
                        }`}
                      >
                        Choose your preferred appearance
                      </p>
                    </div>
                    <Select
                      value={theme}
                      onValueChange={(value) => setTheme(value)}
                    >
                      <SelectTrigger
                        className={`w-[120px] ${
                          isDarkTheme
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-white text-black"
                        }`}
                      >
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl">Change password</h3>
                      <p
                        className={`text-sm ${
                          isDarkTheme ? "text-gray-300" : "text-blue-300"
                        }`}
                      >
                        We'll send you an email with a link to reset your
                        password
                      </p>
                    </div>
                    <button
                      className={`rounded-md px-4 py-2 disabled:opacity-70 ${
                        isDarkTheme
                          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
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
                      <p
                        className={`text-sm ${
                          isDarkTheme ? "text-gray-300" : "text-blue-300"
                        }`}
                      >
                        This will end all your active sessions and require
                        re-login
                      </p>
                    </div>
                    <button
                      className={`rounded-md px-4 py-2 disabled:opacity-70 ${
                        isDarkTheme
                          ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                          : "bg-white text-black hover:bg-gray-200"
                      }`}
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
                      <p
                        className={`text-sm ${
                          isDarkTheme ? "text-gray-300" : "text-blue-300"
                        }`}
                      >
                        This will permanently remove all your data and cannot be
                        undone
                      </p>
                    </div>
                    <button
                      className={`rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-70 ${
                        isDarkTheme ? "bg-gray-700 hover:bg-gray-800" : ""
                      }`}
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
        </div>
      </div>

      {/* Add this to mobile navigation tab */}
      {isMobileView && (
        <style jsx global>{`
          /* Improve touch targets on mobile */
          button {
            min-height: 44px;
          }

          /* Prevent body scrolling when modal is open */
          body.settings-panel-open {
            overflow: hidden;
          }

          /* Make inputs larger on mobile */
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            font-size: 16px !important; /* Prevent zoom on input focus */
          }
        `}</style>
      )}
    </div>
  );
}
