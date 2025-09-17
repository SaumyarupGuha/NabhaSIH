"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTranslation, type Language } from "@/lib/i18n"
import { Calendar, User, Video, MapPin, Star, Search } from "lucide-react"

export default function ConsultationsPage() {
  const [language, setLanguage] = useState<Language>("en")
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const t = useTranslation(language)

  // Mock data for available doctors
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      specialty: "General Medicine",
      experience: "15 years",
      rating: 4.8,
      availability: "Available Today",
      location: "Nabha Civil Hospital",
      languages: ["English", "Hindi", "Punjabi"],
      consultationFee: "₹200",
      image: "/indian-male-doctor.png",
    },
    {
      id: 2,
      name: "Dr. Priya Sharma",
      specialty: "Pediatrics",
      experience: "12 years",
      rating: 4.9,
      availability: "Available Tomorrow",
      location: "Nabha Civil Hospital",
      languages: ["English", "Hindi"],
      consultationFee: "₹250",
      image: "/indian-female-doctor.png",
    },
    {
      id: 3,
      name: "Dr. Harpreet Singh",
      specialty: "Cardiology",
      experience: "20 years",
      rating: 4.7,
      availability: "Available Today",
      location: "Nabha Civil Hospital",
      languages: ["English", "Punjabi"],
      consultationFee: "₹400",
      image: "/indian-doctor-male-sikh.jpg",
    },
  ]

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">{t.consultations}</h1>
          <p className="text-muted-foreground text-pretty">
            Book online consultations with qualified doctors from Nabha Civil Hospital
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find a Doctor</CardTitle>
            <CardDescription>Search by specialty, name, or availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Doctor</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="search" placeholder="Doctor name or specialty" className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Available Today</SelectItem>
                    <SelectItem value="tomorrow">Available Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctors List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Available Doctors</h2>
            <div className="space-y-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className={`cursor-pointer transition-all ${
                    selectedDoctor === doctor.id.toString() ? "ring-2 ring-primary" : "hover:shadow-lg"
                  }`}
                  onClick={() => setSelectedDoctor(doctor.id.toString())}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={doctor.image || "/placeholder.svg"}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">{doctor.name}</h3>
                            <p className="text-muted-foreground">{doctor.specialty}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{doctor.rating}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{doctor.experience}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {doctor.location}
                          </div>
                          <Badge variant="secondary" className="text-green-700 bg-green-100">
                            {doctor.availability}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Languages:</p>
                            <div className="flex gap-1">
                              {doctor.languages.map((lang) => (
                                <Badge key={lang} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Consultation Fee</p>
                            <p className="text-lg font-semibold text-primary">{doctor.consultationFee}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t.bookAppointment}</CardTitle>
                <CardDescription>
                  {selectedDoctor ? "Complete your booking details" : "Select a doctor to book appointment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDoctor ? (
                  <>
                    <div>
                      <Label htmlFor="date">Preferred Date</Label>
                      <Input type="date" id="date" />
                    </div>

                    <div>
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type">Consultation Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select consultation type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Video Consultation
                            </div>
                          </SelectItem>
                          <SelectItem value="inperson">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              In-Person Visit
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="symptoms">Describe Your Symptoms</Label>
                      <Textarea
                        id="symptoms"
                        placeholder="Please describe your symptoms or reason for consultation..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                    </div>

                    <Button className="w-full" size="lg">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      You will receive a confirmation call within 30 minutes
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Please select a doctor from the list to book an appointment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
