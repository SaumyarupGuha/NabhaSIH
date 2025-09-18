"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation, type Language } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { Heart, Stethoscope, Pill, Phone, Users, Clock, MapPin } from "lucide-react"

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)
  const { user } = useAuth()

  const features = [
    {
      icon: Stethoscope,
      title: t.consultations,
      description: "Connect with qualified doctors from Nabha Civil Hospital",
    },
    {
      icon: Pill,
      title: t.pharmacies,
      description: "Find and order medicines from local pharmacies",
    },
    {
      icon: Phone,
      title: t.emergencyContact,
      description: "24/7 emergency support for urgent medical needs",
    },
  ]

  const stats = [
    { icon: Users, value: "500+", label: "Patients Served" },
    { icon: Stethoscope, value: "25+", label: "Doctors Available" },
    { icon: Pill, value: "15+", label: "Partner Pharmacies" },
    { icon: Clock, value: "24/7", label: "Emergency Support" },
  ]

  const getDashboardLink = () => {
    if (!user) return "/auth/login"

    switch (user.role) {
      case "patient":
        return "/patient"
      case "doctor":
        return "/hospital-dashboard"
      case "pharmacist":
        return "/pharmacy-dashboard"
      case "admin":
        return "/admin"
      default:
        return "/auth/login"
    }
  }

  const getWelcomeMessage = () => {
    if (!user) return null

    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">Welcome back, {user.name}!</h3>
        <p className="text-muted-foreground mb-4">
          {user.role === "patient" && "Access your medical records and book consultations"}
          {user.role === "doctor" && "Manage your patients and consultations"}
          {user.role === "pharmacist" && "Handle medicine orders and inventory"}
          {user.role === "admin" && "Oversee the entire healthcare platform"}
        </p>
        <Button asChild>
          <Link href={getDashboardLink()}>Go to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {getWelcomeMessage()}

          <div className="mb-8">
            <Heart className="h-16 w-16 text-primary mx-auto mb-6 fill-current" />
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">{t.heroTitle}</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8">{t.heroSubtitle}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href={user.role === "patient" ? "/consultations" : getDashboardLink()}>
                    <Stethoscope className="mr-2 h-5 w-5" />
                    {user.role === "patient" ? t.bookConsultation : "Go to Dashboard"}
                  </Link>
                </Button>
                {user.role === "patient" && (
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                    <Link href="/pharmacies">
                      <Pill className="mr-2 h-5 w-5" />
                      {t.findPharmacy}
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/auth/signup">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Get Started
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent" asChild>
                  <Link href="/consultations">
                    <Pill className="mr-2 h-5 w-5" />
                    Browse Services
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-balance">
            Healthcare Services for Rural Communities
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-balance">Serving Rural Nabha Communities</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-balance">Ready to Connect with Healthcare?</h2>
          <p className="text-xl mb-8 text-pretty">
            Join hundreds of families in rural Nabha who trust us for their healthcare needs.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
            <Link href={user ? getDashboardLink() : "/auth/signup"}>
              {user ? "Go to Dashboard" : "Get Started Today"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
                <Heart className="h-6 w-6 fill-current" />
                Nabha Health
              </div>
              <p className="text-muted-foreground">Connecting rural communities with quality healthcare services.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Online Consultations</li>
                <li>Medicine Delivery</li>
                <li>Emergency Support</li>
                <li>Health Records</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nabha, Punjab
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Emergency: 108
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Languages</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>English</li>
                <li>हिंदी (Hindi)</li>
                <li>ਪੰਜਾਬੀ (Punjabi)</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Nabha Health. Serving rural communities with care.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
