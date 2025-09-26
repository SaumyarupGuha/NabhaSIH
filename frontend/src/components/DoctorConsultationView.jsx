import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { User, Send, Image } from 'lucide-react';

export const DoctorConsultationView = () => {
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/doctor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Doctor consultations data:', data);
        data.forEach((consultation, index) => {
          console.log(`Consultation ${index}:`, {
            id: consultation._id,
            title: consultation.title,
            photoUrl: consultation.photoUrl,
            hasPhoto: !!consultation.photoUrl
          });
        });
        setConsultations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleReply = async (consultationId) => {
    if (!reply.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/${consultationId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answer: reply })
      });

      if (response.ok) {
        setReply('');
        setSelectedConsultation(null);
        fetchConsultations();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Patient Consultations</h2>
      
      <div className="grid gap-4">
        {consultations.map((consultation) => (
          <Card key={consultation._id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold">{consultation.title}</h3>
                <p className="text-sm text-gray-600">
                  Patient: {consultation.patientId?.firstName} {consultation.patientId?.lastName}
                </p>
              </div>
              <div className="flex gap-2">
                {!consultation.hasReply && (
                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">New</span>
                )}
                {consultation.hasReply && (
                  <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">Replied</span>
                )}
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{consultation.description}</p>
            
            {consultation.photoUrl ? (
              <div className="mb-3">
                <img 
                  src={consultation.photoUrl} 
                  alt="Patient consultation" 
                  className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(consultation.photoUrl, '_blank')}
                  onError={(e) => {
                    console.error('Image failed to load:', consultation.photoUrl);
                    e.target.style.display = 'none';
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">📷 Photo attached</p>
              </div>
            ) : (
              <div className="mb-3">
                <p className="text-xs text-gray-400">No photo attached</p>
              </div>
            )}
            
            {consultation.answer && (
              <div className="bg-blue-50 p-3 rounded mb-3">
                <p className="text-sm font-medium text-blue-800">Your Reply:</p>
                <p className="text-blue-700">{consultation.answer}</p>
              </div>
            )}
            
            {!consultation.hasReply && (
              <div className="mt-3">
                {selectedConsultation === consultation._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full p-2 border rounded-lg h-20 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleReply(consultation._id)}
                        disabled={loading || !reply.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Reply
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedConsultation(null)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setSelectedConsultation(consultation._id)}
                    size="sm"
                  >
                    Reply
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
        
        {consultations.length === 0 && (
          <p className="text-center text-gray-500 py-8">No consultations yet</p>
        )}
      </div>
    </div>
  );
};