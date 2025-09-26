import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { appointmentAPI, prescriptionAPI } from "../lib/api";
import { HealthChatbot } from "../components/HealthChatbot";
import { DoctorConsultation } from "../components/DoctorConsultation";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Pill,
  Phone,
  Eye,
  MessageCircle,
} from "lucide-react";

export default function PatientDashboardSimple() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [appointmentsRes, prescriptionsRes, consultationsRes] = await Promise.all([
          appointmentAPI.getAppointments().catch(() => ({ data: [] })),
          prescriptionAPI.getPrescriptions().catch(() => ({ data: [] })),
          fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/patient`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.ok ? res.json() : []).catch(() => []),
        ]);

        setAppointments(appointmentsRes.data || []);
        setPrescriptions(prescriptionsRes.data || []);
        setConsultations(Array.isArray(consultationsRes) ? consultationsRes : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
        setAppointments([]);
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Portal</h1>
          <p className="text-gray-600">Manage your appointments, prescriptions, and medical records</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Health Assistant</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <Button className="w-full" onClick={() => setChatbotOpen(true)}>
                Ask About Symptoms
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setConsultationOpen(true)}>
                Consult Doctor
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="destructive" className="w-full">
                Call Emergency: 108
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Pill className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Order Medicine</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/pharmacies")}
              >
                Order from Pharmacy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Appointments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Appointments</h2>
              <Button>
                New Appointment
              </Button>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No appointments found</p>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dr. {appointment.doctor?.firstName || "Unknown"}{" "}
                            {appointment.doctor?.lastName || ""}
                          </CardTitle>
                          <CardDescription>
                            {appointment.doctor?.specialization || "General"}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Prescriptions</h2>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No prescriptions found</p>
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Pill className="h-5 w-5" />
                            Prescription #{prescription._id.slice(-6)}
                          </CardTitle>
                          <CardDescription>
                            By Dr. {prescription.doctor?.firstName || "Unknown"}{" "}
                            {prescription.doctor?.lastName || ""} •{" "}
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Medicines:</h4>
                        <ul className="space-y-1">
                          {prescription.medicines?.map((medicine, index) => (
                            <li
                              key={index}
                              className="text-sm text-gray-600 flex items-center gap-2"
                            >
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              {medicine.name} - {medicine.dosage}
                            </li>
                          )) || (
                            <li className="text-sm text-gray-500">No medicines listed</li>
                          )}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Prescription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Previous Consultations */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Previous Consultations</h2>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {consultations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No previous consultations found</p>
                </CardContent>
              </Card>
            ) : (
              consultations.map((consultation) => (
                <Card key={consultation._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{consultation.title}</CardTitle>
                        <CardDescription>
                          Dr. {consultation.doctorId?.firstName} {consultation.doctorId?.lastName} • {new Date(consultation.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={consultation.hasReply ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {consultation.hasReply ? "Replied" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{consultation.description}</p>
                    {consultation.answer && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Doctor's Reply:</p>
                        <p className="text-sm text-blue-700">{consultation.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <HealthChatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />

      <DoctorConsultation
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
      />
    </div>
  );
}