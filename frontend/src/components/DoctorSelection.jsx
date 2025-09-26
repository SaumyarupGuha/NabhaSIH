import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Calendar, Clock, User, MapPin, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export function DoctorSelection({ onSelectDoctor }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    day: '',
    verified: ''
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getDoctors(filters);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Filter by Day</label>
              <select
                value={filters.day}
                onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Days</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Verification Status</label>
              <select
                value={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Doctors</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading doctors...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No doctors found matching your criteria
          </div>
        ) : (
          doctors.map(doctor => (
            <Card key={doctor._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      {doctor.isVerified ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{doctor.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{doctor.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>₹{doctor.consultationFee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Available: {doctor.availableDays?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => onSelectDoctor(doctor)}
                    className="ml-4"
                  >
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}