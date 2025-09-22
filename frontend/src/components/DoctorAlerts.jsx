import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { AlertTriangle, Heart, Thermometer, Activity, X } from 'lucide-react';

export const DoctorAlerts = ({ doctorId }) => {
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showPopup, setShowPopup] = useState(null);

  useEffect(() => {
    console.log('🔌 Initializing socket connection for doctor:', doctorId);
    
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
    });

    // Join doctor room
    newSocket.emit('joinDoctorRoom', doctorId);
    console.log('🏠 Joined doctor room:', `doctor_${doctorId}`);

    // Listen for new alerts
    newSocket.on('newAlert', (data) => {
      console.log('🚨 NEW ALERT RECEIVED:', data);
      console.log('Patient ID:', data.patient._id);
      console.log('Patient Name:', data.patient.firstName, data.patient.lastName);
      console.log('Alert Type:', data.alert.type);
      console.log('Health Data:', data.healthData);
      
      const newAlert = data.alert;
      setAlerts(prev => [newAlert, ...prev]);
      setShowPopup(newAlert);
      
      // Auto-hide popup after 10 seconds
      setTimeout(() => setShowPopup(null), 10000);
    });

    // Fetch existing alerts
    fetchAlerts();

    return () => {
      console.log('🔌 Disconnecting socket');
      newSocket.disconnect();
    };
  }, [doctorId]);

  const fetchAlerts = async () => {
    try {
      console.log('📥 Fetching existing alerts for doctor:', doctorId);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/health-data/alerts/doctor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('📋 Fetched alerts:', data);
      if (data.success) {
        setAlerts(data.data);
        console.log('✅ Set alerts:', data.data.length, 'alerts');
      }
    } catch (error) {
      console.error('❌ Error fetching alerts:', error);
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/health-data/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
      if (showPopup && showPopup._id === alertId) {
        setShowPopup(null);
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'HIGH_TEMPERATURE': return <Thermometer className="h-5 w-5" />;
      case 'HIGH_HEART_RATE': return <Heart className="h-5 w-5" />;
      case 'LOW_OXYGEN': return <Activity className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Doctor ID: {doctorId} | Socket: {socket?.connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
      {/* Alert Popup */}
      {showPopup && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Card className={`border-2 shadow-lg ${getSeverityColor(showPopup.severity)}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAlertIcon(showPopup.type)}
                  <CardTitle className="text-sm">🚨 HEALTH ALERT</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPopup(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium">Patient: {showPopup.patient?.firstName} {showPopup.patient?.lastName}</p>
              <p className="text-xs text-muted-foreground mb-2">ID: {showPopup.patient?._id}</p>
              <p className="text-sm font-medium">{showPopup.message}</p>
              <p className="text-xs text-muted-foreground mt-1">Severity: {showPopup.severity}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => acknowledgeAlert(showPopup._id)}
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPopup(null)}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Health Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <p className="font-medium">
                          {alert.patient?.firstName} {alert.patient?.lastName}
                        </p>
                        <p className="text-sm">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => acknowledgeAlert(alert._id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};