import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ConsultationModal } from './ConsultationModal';
import { Calendar, Clock, User, Phone, MapPin, FileText, Stethoscope, CheckCircle } from 'lucide-react';

export function DoctorQueue() {
  const [queue, setQueue] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await appointmentAPI.getQueue();
      setQueue(response.data);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
    setLoading(false);
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      fetchQueue();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const startConsultation = async (appointmentId) => {
    try {
      await appointmentAPI.startConsultation(appointmentId);
      fetchQueue();
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const openConsultationModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConsultationModal(true);
  };

  const closeConsultationModal = () => {
    setSelectedAppointment(null);
    setShowConsultationModal(false);
  };

  const handleConsultationComplete = () => {
    fetchQueue();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading queue...</div>;
  }

  const queueDates = Object.keys(queue).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Patient Queue</h2>
        <Button onClick={fetchQueue} variant="outline">
          Refresh Queue
        </Button>
      </div>

      {queueDates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No appointments in queue</p>
          </CardContent>
        </Card>
      ) : (
        queueDates.map(date => (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formatDate(date)}
                <Badge variant="secondary">
                  {queue[date].length} appointment{queue[date].length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queue[date].map(appointment => (
                  <div key={appointment._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <h4 className="font-semibold">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </h4>
                          <Badge variant="outline">
                            {appointment.patient.age}y, {appointment.patient.gender}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{appointment.patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{appointment.patient.village}</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 mt-0.5" />
                              <div>
                                <p className="font-medium">Symptoms:</p>
                                <p className="text-gray-700">{appointment.symptoms}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            onClick={() => startConsultation(appointment._id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Stethoscope className="mr-1 h-3 w-3" />
                            Start
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => openConsultationModal(appointment)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      
      {showConsultationModal && selectedAppointment && (
        <ConsultationModal
          appointment={selectedAppointment}
          onClose={closeConsultationModal}
          onComplete={handleConsultationComplete}
        />
      )}
    </div>
  );
}