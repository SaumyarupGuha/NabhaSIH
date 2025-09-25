import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { videoCallAPI } from '../lib/api';
import io from 'socket.io-client';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Textarea } from '../components/ui/Textarea';
import { DoctorAlerts } from '../components/DoctorAlerts';
import { FloatingAlerts } from '../components/FloatingAlerts';
import {
  Users, Calendar, FileText, Pill, Clock, Phone, Stethoscope,
  CheckCircle, Plus, Search, Eye, Edit, Video
} from 'lucide-react';

export default function HospitalDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [patientPhone, setPatientPhone] = useState('');
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    
    // Initialize socket for video calls
    if (user.id || user._id) {
      let socketUrl = import.meta.env.VITE_API_URL || 'https://nabhasih-1.onrender.com/api';
      // Remove /api suffix for socket connection
      socketUrl = socketUrl.replace('/api', '');
      console.log('Socket URL:', socketUrl);
      const newSocket = io(socketUrl);
      setSocket(newSocket);
      
      const userId = user.id || user._id;
      console.log('Doctor joining room:', `doctor_${userId}`);
      
      newSocket.on('connect', () => {
        console.log('Doctor socket connected');
        newSocket.emit('joinDoctorRoom', userId);
      });
      
      newSocket.on('callResponse', (data) => {
        if (data.response === 'accept') {
          localStorage.setItem('currentCallId', data.callId);
          navigate(`/video-room/${data.roomId}`);
        } else {
          alert('Patient declined the call');
        }
        setIsStartingCall(false);
      });
      
      return () => {
        newSocket.disconnect();
      };
    }
  }, [navigate]);
  
  const startVideoCall = async () => {
    if (!patientPhone.trim()) {
      alert('Please enter a patient phone number');
      return;
    }
    
    setIsStartingCall(true);
    console.log('Starting video call with patient:', patientPhone);
    
    try {
      const response = await videoCallAPI.startCall(patientPhone.trim());
      console.log('Video call response:', response);
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('currentCallId', data.callId);
        alert(`Call initiated to ${data.patient.name}. Waiting for patient to accept...`);
      } else {
        alert(data.message || 'Failed to start call');
        setIsStartingCall(false);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      let errorMessage = 'Failed to start call';
      if (error.response?.status === 404) {
        errorMessage = 'Video call service not available. Please check your connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      setIsStartingCall(false);
    }
  };
  const stats = [
    { title: "Today's Patients", value: "42", change: "+8%", icon: Users },
    { title: "Appointments", value: "28", change: "+12%", icon: Calendar },
    { title: "Consultations", value: "35", change: "+5%", icon: Stethoscope },
    { title: "Prescriptions", value: "31", change: "+15%", icon: Pill },
  ];

  const patientQueue = [
    {
      id: 1,
      name: "Rajesh Kumar",
      age: 45,
      gender: "Male",
      phone: "+91 98765 43210",
      village: "Kheri",
      appointmentTime: "10:00 AM",
      symptoms: "Fever, headache, body pain",
      status: "waiting",
      priority: "normal",
    },
    {
      id: 2,
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      phone: "+91 98765 43211",
      village: "Nabha",
      appointmentTime: "10:30 AM",
      symptoms: "Chest pain, breathing difficulty",
      status: "in-consultation",
      priority: "urgent",
    },
  ];

  const recentConsultations = [
    {
      id: 1,
      patient: "Manjeet Kaur",
      age: 38,
      date: "2024-01-15",
      diagnosis: "Hypertension",
      prescription: "Amlodipine 5mg, Lifestyle changes",
      followUp: "2024-02-15",
    },
    {
      id: 2,
      patient: "Sukhdev Singh",
      age: 55,
      date: "2024-01-14",
      diagnosis: "Type 2 Diabetes",
      prescription: "Metformin 500mg, Diet control",
      followUp: "2024-02-14",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in-consultation":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hospital Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Manage patient consultations and medical records - Nabha Civil Hospital
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from yesterday</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="alerts">Health Alerts</TabsTrigger>
            <TabsTrigger value="queue">Patient Queue</TabsTrigger>
            <TabsTrigger value="video-call">Video Call</TabsTrigger>
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger> 
            <TabsTrigger value="records">Medical Records</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            {currentUser && currentUser._id && (
              <DoctorAlerts doctorId={currentUser._id} />
            )}
          </TabsContent>

          <TabsContent value="video-call">
            <Card>
              <CardHeader>
                <CardTitle>Start Video Call</CardTitle>
                <CardDescription>Enter patient's phone number to initiate a video consultation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md">
                  <label className="text-sm font-medium mb-2 block">Patient Phone Number</label>
                  <Input
                    placeholder="Enter patient's phone number"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={startVideoCall}
                  disabled={!patientPhone || isStartingCall}
                  className="w-full max-w-md"
                >
                  <Video className="mr-2 h-4 w-4" />
                  {isStartingCall ? 'Starting Call...' : 'Start Video Call'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Queue</CardTitle>
                    <CardDescription>Manage today's patient appointments and consultations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search patients..." className="pl-10 w-64" />
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Walk-in
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientQueue.map((patient) => (
                    <div key={patient.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {patient.age} years, {patient.gender} • Village: {patient.village}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(patient.priority)}>{patient.priority}</Badge>
                          <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="h-4 w-4" />
                            Appointment: {patient.appointmentTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {patient.phone}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Symptoms:</p>
                          <p className="text-sm text-muted-foreground">{patient.symptoms}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {patient.status === "waiting" && (
                          <Button size="sm">
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Start Consultation
                          </Button>
                        )}
                        {patient.status === "in-consultation" && (
                          <Button size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Consultation
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View History
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Patient
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultations">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Consultations</CardTitle>
                    <CardDescription>View and manage completed consultations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentConsultations.map((consultation) => (
                        <div key={consultation.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{consultation.patient}</h4>
                              <p className="text-sm text-muted-foreground">
                                Age: {consultation.age} • Date: {consultation.date}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div>
                              <span className="text-sm font-medium">Diagnosis: </span>
                              <span className="text-sm text-muted-foreground">{consultation.diagnosis}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Prescription: </span>
                              <span className="text-sm text-muted-foreground">{consultation.prescription}</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Follow-up: </span>
                              <span className="text-sm text-muted-foreground">{consultation.followUp}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Notes
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>New Consultation</CardTitle>
                    <CardDescription>Record consultation details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Patient Name</label>
                      <Input placeholder="Enter patient name" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Age</label>
                        <Input placeholder="Age" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Gender</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Symptoms</label>
                      <Textarea placeholder="Describe symptoms..." rows={3} />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Diagnosis</label>
                      <Textarea placeholder="Enter diagnosis..." rows={2} />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Prescription</label>
                      <Textarea placeholder="Enter prescription details..." rows={3} />
                    </div>

                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Save Consultation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card>
              <CardHeader>
                <CardTitle>Prescribe Medicine</CardTitle>
                <CardDescription>Manage and send prescriptions to pharmacies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Prescription management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>Access and manage patient medical history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Medical records system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Alerts for all doctors */}
      {currentUser && currentUser._id && (
        <FloatingAlerts doctorId={currentUser._id} />
      )}
    </div>
  );
}