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
import { Textarea } from "@/components/ui/textarea"
import { useTranslation, type Language } from "@/lib/i18n"
import { Eye, EyeOff, UserPlus } from "lucide-react"

export default function SignupPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const t = useTranslation(language)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle signup logic here
    console.log("[v0] Signup attempt with role:", userRole)
  }

  const villages = [
    "Nabha",
    "Kheri",
    "Bhadson",
    "Amloh",
    "Samana",
    "Dhuri",
    "Sangrur",
    "Malerkotla",
    "Sunam",
    "Lehragaga",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join Nabha Telemedicine Platform to access healthcare services</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">I want to register as</Label>
                <Select value={userRole} onValueChange={setUserRole} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient / रोगी / ਮਰੀਜ਼</SelectItem>
                    <SelectItem value="doctor">Doctor / डॉक्टर / ਡਾਕਟਰ</SelectItem>
                    <SelectItem value="pharmacist">Pharmacist / फार्मासिस्ट / ਫਾਰਮਾਸਿਸਟ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name / पहला नाम / ਪਹਿਲਾ ਨਾਮ</Label>
                  <Input id="firstName" placeholder="Enter first name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name / अंतिम नाम / ਅੰਤਿਮ ਨਾਮ</Label>
                  <Input id="lastName" placeholder="Enter last name" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age / उम्र / ਉਮਰ</Label>
                  <Input id="age" type="number" placeholder="Enter age" min="1" max="120" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender / लिंग / ਲਿੰਗ</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male / पुरुष / ਮਰਦ</SelectItem>
                      <SelectItem value="female">Female / महिला / ਔਰਤ</SelectItem>
                      <SelectItem value="other">Other / अन्य / ਹੋਰ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number / फोन नंबर / ਫੋਨ ਨੰਬਰ</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address (Optional)</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="village">Village / गांव / ਪਿੰਡ</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your village" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village) => (
                      <SelectItem key={village} value={village.toLowerCase()}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role-specific fields */}
              {userRole === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="license">Medical License Number</Label>
                    <Input id="license" placeholder="Enter license number" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" placeholder="e.g., General Medicine, Pediatrics" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital/Clinic</Label>
                    <Input id="hospital" placeholder="Enter hospital or clinic name" required />
                  </div>
                </>
              )}

              {userRole === "pharmacist" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyLicense">Pharmacy License Number</Label>
                    <Input id="pharmacyLicense" placeholder="Enter pharmacy license" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                    <Input id="pharmacyName" placeholder="Enter pharmacy name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pharmacyAddress">Pharmacy Address</Label>
                    <Textarea id="pharmacyAddress" placeholder="Enter complete address" required />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password / पासवर्ड / ਪਾਸਵਰਡ</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <input type="checkbox" className="rounded border-border mt-1" required />
                <div className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Signup Button */}
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
