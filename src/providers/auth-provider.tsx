"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { redirect ,usePathname} from 'next/navigation'
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/utils/supabase"
import { FullScreenSkeleton } from "@/components/ui/skeletons/full-screen-skeleton"
import { toast } from "sonner"
import { syncUserProfile } from "@/actions/auth"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
 
  const pathname = usePathname()

  // Define public and protected routes
  const publicRoutes = ["/"]
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error.message)
          throw error
        }

        if (mounted) {
          const currentSession = data.session
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          console.log("currentSession", currentSession)

          if (currentSession) {
            await syncUserProfile(currentSession)
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (mounted) {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession) {
          await syncUserProfile(currentSession)

          if (event === "SIGNED_IN") {
            toast.success("Signed in successfully")
            // Let middleware handle the redirect instead of doing it here
          } else if (event === "TOKEN_REFRESHED") {
            console.log("Token refreshed")
          }
        } else if (event === "SIGNED_OUT") {
          toast.info("Signed out")
          // Let middleware handle the redirect instead of doing it here
        }
      }
    })

    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Handle route protection
  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return

    // If user is authenticated and trying to access a public route (like /)
    if (user && isPublicRoute) {
      console.log("Authenticated user redirected from public route to /chat")
      redirect("/chat")
      return
    }

    // If user is not authenticated and trying to access a protected route
    if (!user && !isPublicRoute) {
      console.log("Unauthenticated user redirected from protected route to /")
      redirect('/')
      return
    }
  }, [user, isPublicRoute, isLoading, pathname])

  const signIn = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/chat`,
        },
      })

      if (error) {
        toast.error(error.message)
        throw error
      }

      toast.success("Check your email for the login link!")
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      })

      if (error) {
        toast.error(error.message)
        throw error
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error(error.message)
        throw error
      }

      // Clear user state first
      setUser(null)
      setSession(null)

      // Then redirect (this will now be handled by the route protection useEffect)
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setIsLoading(false)
      // Force redirect to home page
      redirect('/')
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {isLoading && <FullScreenSkeleton />}
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
