"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { authApiClient, type User } from "@/lib/auth-api"

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async (retries = 3) => {
    setIsLoading(true)

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await authApiClient.getUser()
        if (response.success && response.user) {
          setUser(response.user)
          // Store user in localStorage as backup
          localStorage.setItem("user", JSON.stringify(response.user))
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error(`[v0] Auth check attempt ${attempt + 1} failed:`, error)
        if (attempt < retries - 1) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    // If all retries failed, try to restore from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUser(user)
        console.log("[v0] Restored user from localStorage")
      } catch (error) {
        console.error("[v0] Failed to restore user from localStorage:", error)
        setUser(null)
        localStorage.removeItem("user")
      }
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    const response = await authApiClient.login(email, password)
    if (response.success && response.user) {
      setUser(response.user)
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const response = await authApiClient.register(name, email, password, passwordConfirmation)
    if (response.success && response.user) {
      setUser(response.user)
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(response.user))
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const logout = async () => {
    await authApiClient.logout()
    setUser(null)
    // Clear localStorage on logout
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
