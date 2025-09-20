import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { appointmentAPI } from '../lib/api';
import { Calendar, User, Video, MapPin, Star, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ConsultationsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
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

  const specialties = [
    'General Medicine',
    'Pediatrics',
    'Cardiology',
    'Gynecology',
    'Orthopedics',
    'Dermatology',
    'Psychiatry',
    'ENT',
    'Urology',
    'Ophthalmology',
    'Neurology',
    'Oncology',
    'Gastroenterology',
    'Rheumatology',
    'Pulmonology',
    'Endocrinology',
    'Anesthesiology',
    'Radiology',
    'Plastic Surgery',
    'Pathology',
    'Emergency Medicine',
    'Sports Medicine',
    'Physical Medicine',
    'Geriatrics',
    'Nutrition',
    'Critical Care',
    'Trauma Surgery',
    'Intensive Care',
    'Rehabilitation',
    'Occupational Medicine',
    'Family Medicine',
    'Child Health',
    'Homeopathy',
    'Ayurveda',
    'Women\'s Health'
  ];

  // Convert availableDays array to availability object
  const convertAvailabilityFormat = (doctor) => {
    const availability = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: []
    };
    
    if (doctor.availableDays) {
      doctor.availableDays.forEach(day => {
        const dayKey = day.toLowerCase();
        if (availability[dayKey] !== undefined) {
          // Assign different time slots based on day for variety
          const morningSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM'];
          const afternoonSlots = ['2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'];
          const eveningSlots = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'];
          
          // Randomly assign slots for variety
          const allSlots = [...morningSlots, ...afternoonSlots];
          availability[dayKey] = allSlots.slice(0, Math.floor(Math.random() * 4) + 2);
        }
      });
    }
    
    return { ...doctor, availability };
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await appointmentAPI.getDoctors();
        const doctorsWithAvailability = response.data.map(convertAvailabilityFormat);
        setDoctors(doctorsWithAvailability);
        console.log('Loaded doctors from API:', doctorsWithAvailability);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search criteria and selected date
  useEffect(() => {
    let filtered = doctors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialty
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.specialization === selectedSpecialty
      );
    }

    // Filter by availability
    const getDayName = (date) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    };
    
    // Only filter by availability if a specific filter is selected
    if (selectedAvailability === 'today') {
      const todayName = getDayName(new Date());
      filtered = filtered.filter(doctor => 
        doctor.availability && doctor.availability[todayName] && doctor.availability[todayName].length > 0
      );
    } else if (selectedAvailability === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowName = getDayName(tomorrow);
      filtered = filtered.filter(doctor => 
        doctor.availability && doctor.availability[tomorrowName] && doctor.availability[tomorrowName].length > 0
      );
    } else if (selectedAvailability === 'week') {
      filtered = filtered.filter(doctor => {
        if (!doctor.availability) return false;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days.some(day => doctor.availability[day] && doctor.availability[day].length > 0);
      });
    } else {
      // When no specific availability filter, filter by selected date
      const dayName = getDayName(selectedDate);
      filtered = filtered.filter(doctor => 
        doctor.availability && doctor.availability[dayName] && doctor.availability[dayName].length > 0
      );
    }

    console.log('Filtering results:', {
      originalCount: doctors.length,
      filteredCount: filtered.length,
      searchTerm,
      selectedSpecialty,
      selectedAvailability,
      selectedDate: selectedDate.toDateString(),
      dayName: getDayName(selectedDate)
    });
    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty, selectedAvailability, selectedDate]);

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
      alert('Error booking appointment: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date && date < today;
  };

  const getAvailableTimesForDate = (doctor, date) => {
    const getDayName = (date) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    };
    const dayName = getDayName(date);
    return doctor.availability && doctor.availability[dayName] ? doctor.availability[dayName] : [];
  };

  const getDoctorAvailabilityStatus = (doctor) => {
    const getDayName = (date) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      return days[date.getDay()];
    };
    
    const today = new Date();
    const todayName = getDayName(today);
    const todaySlots = doctor.availability && doctor.availability[todayName] ? doctor.availability[todayName] : [];
    
    if (todaySlots.length > 0) {
      return { status: 'Available Today', color: 'text-green-700 bg-green-100' };
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowName = getDayName(tomorrow);
    const tomorrowSlots = doctor.availability && doctor.availability[tomorrowName] ? doctor.availability[tomorrowName] : [];
    
    if (tomorrowSlots.length > 0) {
      return { status: 'Available Tomorrow', color: 'text-blue-700 bg-blue-100' };
    }
    
    return { status: 'Limited Availability', color: 'text-orange-700 bg-orange-100' };
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
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="search">Search Doctor</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search" 
                    placeholder="Doctor name or specialty" 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <select 
                  id="specialty"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select specialty</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <select 
                  id="availability"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">All Doctors</option>
                  <option value="today">Available Today</option>
                  <option value="tomorrow">Available Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="mb-4">
              <Label>Select Date</Label>
              <div className="mt-2 p-4 border rounded-lg bg-background">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(newMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && !isPastDate(date) && setSelectedDate(date)}
                      disabled={!date || isPastDate(date)}
                      className={`
                        p-2 text-sm rounded-md transition-colors
                        ${!date ? 'invisible' : ''}
                        ${isPastDate(date) ? 'text-muted-foreground cursor-not-allowed' : 'hover:bg-muted'}
                        ${isToday(date) ? 'bg-primary/10 text-primary font-semibold' : ''}
                        ${isSelected(date) ? 'bg-primary text-primary-foreground' : ''}
                      `}
                    >
                      {date ? date.getDate() : ''}
                    </button>
                  ))}
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  Selected: {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Available Doctors</h2>
            <div className="space-y-6">
              {filteredDoctors.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      {doctors.length === 0 ? 'No doctors available at the moment' : 'No doctors match your search criteria'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredDoctors.map((doctor) => (
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
                            <Badge variant="secondary" className={getDoctorAvailabilityStatus(doctor).color}>
                              {getDoctorAvailabilityStatus(doctor).status}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Available Times ({selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}):</p>
                              <div className="flex gap-1 flex-wrap">
                                {getAvailableTimesForDate(doctor, selectedDate).length > 0 ? (
                                  getAvailableTimesForDate(doctor, selectedDate).slice(0, 3).map(time => (
                                    <Badge key={time} variant="outline" className="text-xs">{time}</Badge>
                                  ))
                                ) : (
                                  <Badge variant="outline" className="text-xs text-muted-foreground">Not Available</Badge>
                                )}
                                {getAvailableTimesForDate(doctor, selectedDate).length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{getAvailableTimesForDate(doctor, selectedDate).length - 3} more</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Consultation Fee</p>
                              <p className="text-lg font-semibold text-primary">₹{doctor.consultationFee}</p>
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
                        <Label htmlFor="time">Preferred Time</Label>
                        <select 
                          value={bookingData.time}
                          onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select time slot</option>
                          {selectedDoctor && getAvailableTimesForDate(selectedDoctor, selectedDate).map((time) => (
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