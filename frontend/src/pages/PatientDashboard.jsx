import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { appointmentAPI, prescriptionAPI } from '../lib/api';
import { Calendar, Clock, User, FileText, Pill, Phone, Plus, Eye } from 'lucide-react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, prescriptionsRes] = await Promise.all([
          appointmentAPI.getAppointments(),
          prescriptionAPI.getPrescriptions()
        ]);
        
        setAppointments(appointmentsRes.data);
        setPrescriptions(prescriptionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Portal</h1>
          <p className="text-muted-foreground">
            Manage your appointments, prescriptions, and medical records
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Book Appointment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">Book New Consultation</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
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
              <Pill className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Order Medicine</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                Order from Pharmacy
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Appointments</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No appointments found</p>
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
                            Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                          </CardTitle>
                          <CardDescription>{appointment.doctor?.specialization}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                        {appointment.status === 'scheduled' ? (
                          <>
                            <Button size="sm">Join Consultation</Button>
                            <Button size="sm" variant="outline">
                              Reschedule
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

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
                    <p className="text-muted-foreground">No prescriptions found</p>
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
                            By Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName} • {' '}
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
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              {medicine.name} - {medicine.dosage}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Prescription
                        </Button>
                        {prescription.status === 'active' && (
                          <Button size="sm">
                            <Pill className="h-4 w-4 mr-2" />
                            Order Medicines
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Medical History</h2>
            <Button size="sm" variant="outline">
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
                    <h4 className="font-medium">Recent Consultation</h4>
                    <p className="text-sm text-muted-foreground">General checkup and treatment</p>
                    <p className="text-xs text-muted-foreground">
                      {appointments.length > 0 ? new Date(appointments[0]?.date).toLocaleDateString() : 'No recent activity'}
                    </p>
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
  );
}