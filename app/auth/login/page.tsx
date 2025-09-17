"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation, type Language } from "@/lib/i18n"
import { Eye, EyeOff, LogIn, Phone, Mail } from "lucide-react"

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")
  const [userRole, setUserRole] = useState<string>("")
  const t = useTranslation(language)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("[v0] Login attempt with role:", userRole)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t.login}</CardTitle>
            <CardDescription>Access your account on Nabha Telemedicine Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={userRole} onValueChange={setUserRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient / रोगी / ਮਰੀਜ਼</SelectItem>
                    <SelectItem value="doctor">Doctor / डॉक्टर / ਡਾਕਟਰ</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist / फार्मासिस्ट / ਫਾਰਮਾਸਿਸਟ</SelectItem>
                    <SelectItem value="admin">Admin / प्रशासक / ਪ੍ਰਸ਼ਾਸਕ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Login Method Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={loginMethod === "phone" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod("phone")}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Phone
                </Button>
                <Button
                  type="button"
                  variant={loginMethod === "email" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod("email")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>

              {/* Phone/Email Input */}
              <div className="space-y-2">
                <Label htmlFor="contact">
                  {loginMethod === "phone" ? "Phone Number / फोन नंबर / ਫੋਨ ਨੰਬਰ" : "Email Address"}
                </Label>
                <Input
                  id="contact"
                  type={loginMethod === "phone" ? "tel" : "email"}
                  placeholder={loginMethod === "phone" ? "+91 98765 43210" : "your@email.com"}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password / पासवर्ड / ਪਾਸਵਰਡ</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span>Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                {t.login}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
