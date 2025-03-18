"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { clearUserData } from "./storage"

/**
 * Deletes a user account and all associated data
 * This must be done server-side to properly manage security
 */
export async function deleteUserAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    // Initialize the Supabase client with service role for admin functions
    // NOTE: This requires setting SUPABASE_SERVICE_ROLE_KEY in your environment
    const supabase = createServerActionClient({ 
      cookies,
      options: {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        },
      },
    })
    
    // First get the current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // 1. Clear all user data from storage
    await clearUserData() 
    
    // 2. Delete profile data
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id)
    
    if (profileError) throw profileError
    
    // 3. Delete any additional user data from other tables
    // Add any other tables that contain user data here
    const { error: filesError } = await supabase
      .from("user_files")
      .delete()
      .eq("user_id", user.id)
      
    if (filesError) throw filesError
    
    // 4. Delete auth user (requires admin rights configured in Supabase)
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (authError) throw authError
    
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting user account:", error)
    return { 
      success: false, 
      error: error.message || "Failed to delete account" 
    }
  }
} 