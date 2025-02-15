"use client";

import { Button } from "@/components/ui/signin/button";
import {
    getCurrentSession,
    getCurrentUser,
    signOut,
} from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a valid session
        const { session, error: sessionError } = await getCurrentSession();
        if (sessionError || !session) {
          router.push("/signin");
          return;
        }

        // Then get the user data
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) {
          router.push("/signin");
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      router.push("/signin");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will handle redirect
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.user_metadata?.full_name && (
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{user.user_metadata.full_name}</p>
              </div>
            )}
            <Button onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
