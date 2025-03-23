import { createClient } from "@supabase/supabase-js"

export type UserProfile = {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

// Create a singleton instance for the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// For backward compatibility
export const supabase = {
  auth: {
    getUser: async () => {
      try {
        return await getSupabase().auth.getUser()
      } catch (error) {
        console.error("Error getting user:", error)
        return { data: { user: null }, error }
      }
    },
  },
  from: (table: string) => {
    try {
      return getSupabase().from(table)
    } catch (error) {
      console.error(`Error accessing table ${table}:`, error)
      // Return a dummy object that won't cause runtime errors
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error }),
          }),
        }),
        upsert: async () => ({ data: null, error }),
      }
    }
  },
  storage: {
    from: (bucket: string) => {
      try {
        return getSupabase().storage.from(bucket)
      } catch (error) {
        console.error(`Error accessing storage bucket ${bucket}:`, error)
        // Return a dummy object that won't cause runtime errors
        return {
          upload: async () => ({ data: null, error }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }
      }
    },
  },
}

