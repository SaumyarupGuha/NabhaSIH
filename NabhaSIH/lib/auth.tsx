"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

export interface User {
  id: string
  name: string
  email?: string
  phone: string
  role: "patient" | "doctor" | "pharmacist" | "admin"
  village: string
  isVerified: boolean
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  signup: (userData: SignupData) => Promise<boolean>
  isLoading: boolean
}

interface LoginCredentials {
  contact: string // phone or email
  password: string
  role: string
}

interface SignupData {
  firstName: string
  lastName: string
  phone: string
  email?: string
  password: string
  role: "patient" | "doctor" | "pharmacist"
  village: string
  age: number
  gender: string
  // Role-specific fields
  license?: string
  specialization?: string
  hospital?: string
  pharmacyName?: string
  pharmacyAddress?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("telemedicine_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Mock authentication - replace with actual API call
      console.log("[v0] Login attempt:", credentials)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data based on role
      const mockUser: User = {
        id: "user_" + Date.now(),
        name:
          credentials.role === "doctor"
            ? "Dr. Priya Sharma"
            : credentials.role === "pharmacist"
              ? "Sukhdev Singh"
              : credentials.role === "admin"
                ? "Admin User"
                : "Rajesh Kumar",
        email: credentials.contact.includes("@") ? credentials.contact : undefined,
        phone: credentials.contact.includes("@") ? "+91 98765 43210" : credentials.contact,
        role: credentials.role as User["role"],
        village: "Nabha",
        isVerified: true,
        avatar: `/placeholder.svg?height=40&width=40&query=${credentials.role}`,
      }

      setUser(mockUser)
      localStorage.setItem("telemedicine_user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Mock signup - replace with actual API call
      console.log("[v0] Signup attempt:", userData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newUser: User = {
        id: "user_" + Date.now(),
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        village: userData.village,
        isVerified: userData.role === "patient", // Patients auto-verified, others need approval
      }

      setUser(newUser)
      localStorage.setItem("telemedicine_user", JSON.stringify(newUser))
      return true
    } catch (error) {
      console.error("[v0] Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("telemedicine_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Route protection hook
export function useRequireAuth(allowedRoles?: User["role"][]) {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login"
    }

    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to unauthorized page if role not allowed
      window.location.href = "/unauthorized"
    }
  }, [user, isLoading, allowedRoles])

  return { user, isLoading }
}
