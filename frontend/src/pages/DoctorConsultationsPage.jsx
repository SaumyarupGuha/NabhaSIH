import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { MessageCircle, Send, User, Image } from 'lucide-react';

export default function DoctorConsultationsPage() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setConsultations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (consultationId, answer) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/${consultationId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answer })
      });
      if (response.ok) {
        fetchConsultations();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const markAsRead = async (consultationId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/online-prescriptions/${consultationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchConsultations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">Loading consultations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Online Consultations</h1>
          <p className="text-muted-foreground">Manage patient consultation requests</p>
        </div>

        <div className="space-y-6">
          {consultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No consultation requests yet</p>
              </CardContent>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <ConsultationCard
                key={consultation._id}
                consultation={consultation}
                onReply={handleReply}
                onMarkRead={markAsRead}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const ConsultationCard = ({ consultation, onReply, onMarkRead }) => {
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(consultation._id, replyText);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  return (
    <Card className={!consultation.isRead ? 'border-blue-200 bg-blue-50/30' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{consultation.patientId?.firstName} {consultation.patientId?.lastName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(consultation.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!consultation.isRead && (
              <Badge variant="destructive">New</Badge>
            )}
            {consultation.hasReply && (
              <Badge variant="secondary">Replied</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Patient's Request:</h4>
          <p className="text-sm font-semibold text-gray-800 mb-1">{consultation.title}</p>
          <p className="text-sm bg-gray-50 p-3 rounded-lg">{consultation.description}</p>
          {consultation.photo && (
            <div className="mt-2">
              <img 
                src={consultation.photo} 
                alt="Patient submission" 
                className="max-w-xs rounded-lg border"
              />
            </div>
          )}
        </div>

        {consultation.answer && (
          <div>
            <h4 className="font-medium mb-2">Your Answer:</h4>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p className="text-sm text-green-800">{consultation.answer}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!consultation.isRead && (
            <Button size="sm" variant="outline" onClick={() => onMarkRead(consultation._id)}>
              Mark as Read
            </Button>
          )}
          
          {!consultation.hasReply && (
            <Button size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Reply
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className="space-y-3 border-t pt-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply to the patient..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply} disabled={!replyText.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};