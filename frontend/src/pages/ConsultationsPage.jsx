import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { appointmentAPI } from '../lib/api';
import { Calendar, User, Video, MapPin, Star, Search } from 'lucide-react';

export default function ConsultationsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'video',
    symptoms: '',
    phone: ''
  });

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await appointmentAPI.getDoctors();
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    try {
      await appointmentAPI.bookAppointment({
        doctorId: selectedDoctor._id,
        ...bookingData
      });
      alert('Appointment booked successfully!');
      setBookingData({ date: '', time: '', type: 'video', symptoms: '', phone: '' });
      setSelectedDoctor(null);
    } catch (error) {
      alert('Error booking appointment: ' + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">Loading doctors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Consultations</h1>
          <p className="text-muted-foreground">
            Book online consultations with qualified doctors from Nabha Civil Hospital
          </p>
        </div>

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
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Select specialty</option>
                  <option value="general">General Medicine</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="orthopedics">Orthopedics</option>
                </select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">Select availability</option>
                  <option value="today">Available Today</option>
                  <option value="tomorrow">Available Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Available Doctors</h2>
            <div className="space-y-6">
              {doctors.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No doctors available at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                doctors.map((doctor) => (
                  <Card
                    key={doctor._id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?._id === doctor._id ? "ring-2 ring-primary" : "hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </h3>
                              <p className="text-muted-foreground">{doctor.specialization}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">4.8</span>
                              </div>
                              <p className="text-sm text-muted-foreground">10+ years</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {doctor.hospital}
                            </div>
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              Available Today
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Languages:</p>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">English</Badge>
                                <Badge variant="outline" className="text-xs">Hindi</Badge>
                                <Badge variant="outline" className="text-xs">Punjabi</Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Consultation Fee</p>
                              <p className="text-lg font-semibold text-primary">₹200</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
                <CardDescription>
                  {selectedDoctor ? "Complete your booking details" : "Select a doctor to book appointment"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDoctor ? (
                  <form onSubmit={handleBooking}>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="date">Preferred Date</Label>
                        <Input 
                          type="date" 
                          id="date" 
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="time">Preferred Time</Label>
                        <select 
                          value={bookingData.time}
                          onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select time slot</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="type">Consultation Type</Label>
                        <select 
                          value={bookingData.type}
                          onChange={(e) => setBookingData({...bookingData, type: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="video">Video Consultation</option>
                          <option value="in-person">In-Person Visit</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="symptoms">Describe Your Symptoms</Label>
                        <Textarea
                          id="symptoms"
                          placeholder="Please describe your symptoms or reason for consultation..."
                          rows={3}
                          value={bookingData.symptoms}
                          onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          placeholder="+91 XXXXX XXXXX" 
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        You will receive a confirmation call within 30 minutes
                      </p>
                    </div>
                  </form>
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
  );
}