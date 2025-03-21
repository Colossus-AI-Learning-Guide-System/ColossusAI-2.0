import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/utils/supabaseClient'

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url?: string | null
  updated_at: string | null
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching user data...")
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("Error fetching auth user:", userError)
        setIsAuthenticated(false)
        setProfile(null)
        throw userError
      }
      
      if (!user) {
        console.log("No authenticated user found")
        setIsAuthenticated(false)
        setProfile(null)
        return null
      }
      
      console.log("User authenticated:", user.id)
      setIsAuthenticated(true)
      
      // Now fetch the profile data
      console.log("Fetching profile data for user:", user.id)
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (profileError) {
        console.error("Error fetching profile:", profileError)
        
        // If no profile exists for this user, create one
        if (profileError.code === 'PGRST116') {
          console.log("Profile not found, creating a new profile")
          return await createInitialProfile(user.id, user.email)
        }
        
        throw profileError
      }
      
      console.log("Profile data fetched successfully:", data)
      setProfile(data)
      return data
    } catch (err) {
      console.error('Error in fetchProfile:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return null
    } finally {
      setLoading(false)
    }
  }
  
  // Create an initial profile if one doesn't exist
  const createInitialProfile = async (userId: string, email: string | undefined) => {
    try {
      console.log("Creating initial profile for user:", userId)
      const newProfile = {
        id: userId,
        full_name: '',
        email: email || '',
        updated_at: new Date().toISOString(),
      }
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile)
        
      if (insertError) {
        console.error("Error creating initial profile:", insertError)
        throw insertError
      }
      
      console.log("Initial profile created successfully")
      setProfile(newProfile)
      return newProfile
    } catch (err) {
      console.error('Error in createInitialProfile:', err)
      setError(err instanceof Error ? err : new Error('Error creating profile'))
      return null
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log("No authenticated user found, cannot update profile")
        setIsAuthenticated(false)
        throw new Error('User not authenticated')
      }
      
      console.log("Updating profile for user:", user.id, "with data:", updates)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        
      if (updateError) {
        console.error("Error updating profile:", updateError)
        throw updateError
      }
      
      console.log("Profile updated successfully, fetching updated profile")
      // Fetch the updated profile
      return await fetchProfile()
    } catch (err) {
      console.error('Error in updateProfile:', err)
      setError(err instanceof Error ? err : new Error('Unknown error occurred'))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch profile on mount and also set up a Supabase auth state listener
  useEffect(() => {
    console.log("useProfile hook mounted")
    
    const fetchInitialProfile = async () => {
      await fetchProfile()
    }
    
    fetchInitialProfile()
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session ? "Session exists" : "No session")
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed, fetching profile")
          fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing profile")
          setProfile(null)
          setIsAuthenticated(false)
        }
      }
    )
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    profile,
    loading,
    error,
    isAuthenticated,
    fetchProfile,
    updateProfile,
  }
} 