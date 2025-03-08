"use server"

import { supabase } from "@/app/lib/utils/supabaseClient"
import { type StorageStats, STORAGE_LIMITS } from "@/app/types/storage"
import { PlanType } from "@/app/components/settings-panel"

export async function getStorageStats(): Promise<StorageStats> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Get user's subscription plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan, memory_enabled")
      .eq("id", user.id)
      .single()

    if (!profile) throw new Error("Profile not found")

    // Get storage usage
    const { data: files } = await supabase.from("user_files").select("file_size").eq("user_id", user.id)

    const usedStorage = files?.reduce((total, file) => total + (file.file_size || 0), 0) || 0
    const maxStorage = STORAGE_LIMITS[profile.subscription_plan as PlanType || "free"]

    return {
      usedStorage,
      maxStorage,
      isMemoryEnabled: profile.memory_enabled || false,
    }
  } catch (error) {
    console.error("Error getting storage stats:", error)
    return {
      usedStorage: 0,
      maxStorage: STORAGE_LIMITS.free,
      isMemoryEnabled: false,
    }
  }
}

export async function toggleMemory(enabled: boolean): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("profiles").update({ memory_enabled: enabled }).eq("id", user.id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error toggling memory:", error)
    return false
  }
}

export async function clearUserData(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    // Delete all user files
    const { error: deleteError } = await supabase.from("user_files").delete().eq("user_id", user.id)

    if (deleteError) throw deleteError

    // Clear storage bucket
    const { error: storageError } = await supabase.storage.from("user_files").remove([`${user.id}/*`])

    if (storageError) throw storageError

    return true
  } catch (error) {
    console.error("Error clearing user data:", error)
    return false
  }
}

