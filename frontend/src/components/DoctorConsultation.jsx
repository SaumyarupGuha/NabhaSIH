import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { User, Send, X, Upload, Image } from 'lucide-react';

export const DoctorConsultation = ({ isOpen, onClose }) => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchConsultations();
      fetchDoctors();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/patient`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConsultations(Array.isArray(data) ? data : []);
      } else {
        setConsultations([]);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setConsultations([]);
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors from:', `${import.meta.env.VITE_API_URL}/users?role=doctor`);
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?role=doctor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Doctors data received:', result);
        const data = result.data || result;
        console.log('Extracted doctors array:', data);
        console.log('Is array:', Array.isArray(data));
        console.log('Length:', data.length);
        setDoctors(Array.isArray(data) ? data : []);
      } else {
        console.log('Response not ok, setting empty array');
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('doctorId', selectedDoctor);
      formData.append('title', title);
      formData.append('description', description);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: formData
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setPhoto(null);
        setSelectedDoctor('');
        fetchConsultations();
        onClose();
      }
    } catch (error) {
      console.error('Error sending consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="flex flex-col bg-white w-full max-w-2xl h-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between py-3 bg-white">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Doctor Consultation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex flex-col p-6 bg-white">
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Doctor</label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}{doctor.specialization ? ` - ${doctor.specialization}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for your consultation..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your symptoms or concerns..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photo (Optional)</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </label>
                {photo && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    {photo.name}
                  </span>
                )}
              </div>
            </div>




          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={handleSubmit} 
              disabled={loading || !selectedDoctor || !title.trim() || !description.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};