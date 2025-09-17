"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation, type Language } from "@/lib/i18n"
import { Calendar, Clock, User, FileText, Pill, Phone, Plus, Eye } from "lucide-react"

export default function PatientPortal() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)

  // Mock data for patient appointments
  const appointments = [
    {
      id: 1,
      doctor: "Dr. Rajesh Kumar",
      specialty: "General Medicine",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "upcoming",
      type: "video",
    },
    {
      id: 2,
      doctor: "Dr. Priya Sharma",
      specialty: "Pediatrics",
      date: "2024-01-10",
      time: "2:30 PM",
      status: "completed",
      type: "in-person",
    },
  ]

  const prescriptions = [
    {
      id: 1,
      doctor: "Dr. Rajesh Kumar",
      date: "2024-01-10",
      medicines: ["Paracetamol 500mg", "Cough Syrup", "Vitamin D3"],
      status: "active",
    },
    {
      id: 2,
      doctor: "Dr. Priya Sharma",
      date: "2024-01-05",
      medicines: ["Amoxicillin 250mg", "ORS Packets"],
      status: "completed",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Patient Portal</h1>
          <p className="text-muted-foreground text-pretty">
            Manage your appointments, prescriptions, and medical records
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t.bookAppointment}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Book New Consultation</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t.emergencyContact}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="destructive" className="w-full">
                Call Emergency: 108
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Pill className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">{t.orderMedicine}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full bg-transparent">
                Order from Pharmacy
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Appointments Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{t.myAppointments}</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {appointment.doctor}
                        </CardTitle>
                        <CardDescription>{appointment.specialty}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appointment.status === "upcoming" ? (
                        <>
                          <Button size="sm">Join Consultation</Button>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Reschedule
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Prescriptions Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">{t.prescriptions}</h2>
              <Button size="sm" variant="outline" className="bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="h-5 w-5" />
                          Prescription #{prescription.id}
                        </CardTitle>
                        <CardDescription>
                          By {prescription.doctor} • {prescription.date}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(prescription.status)}>{prescription.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Medicines:</h4>
                      <ul className="space-y-1">
                        {prescription.medicines.map((medicine, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            {medicine}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Prescription
                      </Button>
                      {prescription.status === "active" && (
                        <Button size="sm">
                          <Pill className="h-4 w-4 mr-2" />
                          Order Medicines
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t.medicalHistory}</h2>
            <Button size="sm" variant="outline" className="bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Download Records
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Medical Activity</CardTitle>
              <CardDescription>Your recent consultations and health records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Consultation with Dr. Rajesh Kumar</h4>
                    <p className="text-sm text-muted-foreground">General checkup and fever treatment</p>
                    <p className="text-xs text-muted-foreground">January 10, 2024</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Lab Report Uploaded</h4>
                    <p className="text-sm text-muted-foreground">Blood test results from Nabha Civil Hospital</p>
                    <p className="text-xs text-muted-foreground">January 8, 2024</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
