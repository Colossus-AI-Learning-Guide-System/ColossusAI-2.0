import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a Supabase client for client-side usage with better session handling
export const supabase = createClientComponentClient()

// Export a function to get the session, useful for debugging
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

