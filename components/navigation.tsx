"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation, type Language } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { Heart, Menu, X, User, LogOut } from "lucide-react"

export function Navigation() {
  const [language, setLanguage] = useState<Language>("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslation(language)
  const { user, logout } = useAuth()

  const getNavigationItems = () => {
    const baseItems = [{ href: "/", label: t.home }]

    if (!user) {
      return [
        ...baseItems,
        { href: "/consultations", label: t.consultations },
        { href: "/pharmacies", label: t.pharmacies },
        { href: "/hospitals", label: t.hospitals },
      ]
    }

    // Role-based navigation
    switch (user.role) {
      case "patient":
        return [
          ...baseItems,
          { href: "/patient", label: "My Dashboard" },
          { href: "/consultations", label: t.consultations },
          { href: "/pharmacies", label: t.pharmacies },
        ]
      case "doctor":
        return [
          ...baseItems,
          { href: "/hospital-dashboard", label: "Doctor Dashboard" },
          { href: "/hospitals", label: t.hospitals },
        ]
      case "pharmacist":
        return [
          ...baseItems,
          { href: "/pharmacy-dashboard", label: "Pharmacy Dashboard" },
          { href: "/pharmacies", label: t.pharmacies },
        ]
      case "admin":
        return [
          ...baseItems,
          { href: "/admin", label: t.admin },
          { href: "/hospital-dashboard", label: "Hospital View" },
          { href: "/pharmacy-dashboard", label: "Pharmacy View" },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-balance">Nabha Health</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />

            {/* Auth Controls */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({user.role})</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">{t.login}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border pt-2 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground capitalize">{user.role}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t.login}
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-4 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
