"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTranslation, type Language } from "@/lib/i18n"
import { MapPin, Phone, Clock, Star, Search, NavigationIcon, Pill } from "lucide-react"

export default function PharmaciesPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null)
  const t = useTranslation(language)

  // Mock data for local pharmacies
  const pharmacies = [
    {
      id: 1,
      name: "Sharma Medical Store",
      owner: "Rajesh Sharma",
      address: "Main Market, Nabha",
      phone: "+91 98765 43210",
      rating: 4.8,
      openHours: "8:00 AM - 10:00 PM",
      services: ["Home Delivery", "Online Orders", "24/7 Emergency"],
      specialties: ["General Medicines", "Ayurvedic", "Baby Care"],
      distance: "0.5 km",
      image: "/pharmacy-1.jpg",
      availability: "Open Now",
    },
    {
      id: 2,
      name: "Nabha Pharmacy",
      owner: "Preet Kaur",
      address: "Civil Hospital Road, Nabha",
      phone: "+91 98765 43211",
      rating: 4.6,
      openHours: "7:00 AM - 11:00 PM",
      services: ["Home Delivery", "Online Orders", "Insurance Claims"],
      specialties: ["General Medicines", "Diabetic Care", "Heart Medicines"],
      distance: "1.2 km",
      image: "/pharmacy-2.jpg",
      availability: "Open Now",
    },
    {
      id: 3,
      name: "Punjab Medical Hall",
      owner: "Harpreet Singh",
      address: "Bus Stand Road, Nabha",
      phone: "+91 98765 43212",
      rating: 4.7,
      openHours: "6:00 AM - 12:00 AM",
      services: ["Home Delivery", "24/7 Emergency", "Online Orders"],
      specialties: ["General Medicines", "Surgical Items", "Wellness Products"],
      distance: "2.1 km",
      image: "/pharmacy-3.jpg",
      availability: "Open Now",
    },
  ]

  const commonMedicines = [
    { name: "Paracetamol 500mg", price: "₹15", availability: "In Stock" },
    { name: "Crocin Advance", price: "₹25", availability: "In Stock" },
    { name: "Cough Syrup", price: "₹45", availability: "In Stock" },
    { name: "ORS Packets", price: "₹8", availability: "In Stock" },
    { name: "Vitamin D3", price: "₹120", availability: "Limited Stock" },
    { name: "Amoxicillin 250mg", price: "₹85", availability: "In Stock" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">{t.pharmacies}</h1>
          <p className="text-muted-foreground text-pretty">
            Find local pharmacies in Nabha and surrounding areas for medicine delivery
          </p>
        </div>

        {/* Search and Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search medicines or pharmacy name..." className="pl-10" />
            </div>
          </div>
          <Button className="w-full">
            <Pill className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <Phone className="mr-2 h-4 w-4" />
            Emergency Order
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pharmacies List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Local Pharmacies</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {pharmacies.length} pharmacies available
              </Badge>
            </div>

            <div className="space-y-6">
              {pharmacies.map((pharmacy) => (
                <Card
                  key={pharmacy.id}
                  className={`cursor-pointer transition-all ${
                    selectedPharmacy === pharmacy.id.toString() ? "ring-2 ring-primary" : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedPharmacy(pharmacy.id.toString())}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={pharmacy.image || "/placeholder.svg?height=80&width=80&query=pharmacy store"}
                        alt={pharmacy.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{pharmacy.name}</h3>
                            <p className="text-muted-foreground">Owner: {pharmacy.owner}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{pharmacy.rating}</span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              {pharmacy.availability}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {pharmacy.address} • {pharmacy.distance}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {pharmacy.openHours}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {pharmacy.phone}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {pharmacy.services.map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {pharmacy.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs bg-primary/10">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm">
                            <Pill className="mr-2 h-4 w-4" />
                            Order Medicines
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <Phone className="mr-2 h-4 w-4" />
                            Call Now
                          </Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            <NavigationIcon className="mr-2 h-4 w-4" />
                            Get Directions
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Order & Common Medicines */}
          <div className="space-y-6">
            {/* Quick Order */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Medicine Order</CardTitle>
                <CardDescription>Order common medicines instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {commonMedicines.map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{medicine.name}</h4>
                        <p className="text-xs text-muted-foreground">{medicine.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            medicine.availability === "In Stock"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {medicine.availability}
                        </Badge>
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">View Cart & Checkout</Button>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Medicine</CardTitle>
                <CardDescription>24/7 emergency medicine delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Need urgent medicines? Call our emergency hotline for immediate assistance.
                </p>
                <Button variant="destructive" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Emergency: 108
                </Button>
              </CardContent>
            </Card>

            {/* Prescription Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Prescription</CardTitle>
                <CardDescription>Get medicines delivered based on doctor's prescription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a photo of your prescription or upload an image
                  </p>
                  <Button variant="outline" className="bg-transparent">
                    Upload Prescription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">How Medicine Delivery Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Prescription</h3>
              <p className="text-sm text-muted-foreground">Take a photo of your prescription or search for medicines</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Pharmacy</h3>
              <p className="text-sm text-muted-foreground">Select from nearby pharmacies with best prices</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Confirm Order</h3>
              <p className="text-sm text-muted-foreground">Review medicines and confirm your order</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Get Delivery</h3>
              <p className="text-sm text-muted-foreground">Receive medicines at your doorstep within 2 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
