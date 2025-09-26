import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, MessageCircle, Calendar, FileText, Bell } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [consultations, setConsultations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/consultations/doctor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setConsultations(data);
      setUnreadCount(data.filter(c => !c.isRead).length);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleReply = async (consultationId, reply) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reply })
      });
      fetchConsultations();
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const markAsRead = async (consultationId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/consultations/${consultationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchConsultations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your patients and consultations</p>
        </div>

        <div className="flex gap-6 mb-8">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'consultations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('consultations')}
            className="relative"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Online Consultations
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Today's Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-muted-foreground">Scheduled consultations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Online Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{consultations.length}</div>
                <p className="text-muted-foreground">{unreadCount} unread</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Online Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                {consultations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No consultations yet</p>
                ) : (
                  <div className="space-y-4">
                    {consultations.map((consultation) => (
                      <ConsultationCard
                        key={consultation._id}
                        consultation={consultation}
                        onReply={handleReply}
                        onMarkRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
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

  const handleMarkRead = () => {
    onMarkRead(consultation._id);
  };

  return (
    <div className={`p-4 border rounded-lg ${!consultation.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{consultation.patientName}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(consultation.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          {!consultation.isRead && (
            <Badge variant="destructive" className="text-xs">New</Badge>
          )}
          {consultation.hasReply && (
            <Badge variant="secondary" className="text-xs">Replied</Badge>
          )}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm">{consultation.description}</p>
        {consultation.photoUrl && (
          <img 
            src={consultation.photoUrl} 
            alt="Patient submission" 
            className="mt-2 max-w-xs rounded-lg"
          />
        )}
      </div>

      {consultation.reply && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm font-medium text-green-800">Your Reply:</p>
          <p className="text-sm text-green-700">{consultation.reply}</p>
        </div>
      )}

      <div className="flex gap-2">
        {!consultation.isRead && (
          <Button size="sm" variant="outline" onClick={handleMarkRead}>
            Mark as Read
          </Button>
        )}
        
        {!consultation.hasReply && (
          <Button size="sm" onClick={() => setShowReplyForm(!showReplyForm)}>
            Reply
          </Button>
        )}
      </div>

      {showReplyForm && (
        <div className="mt-3 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20 resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmitReply}>
              Send Reply
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};