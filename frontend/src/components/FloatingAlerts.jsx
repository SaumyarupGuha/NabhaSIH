import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, X } from 'lucide-react';

export const FloatingAlerts = ({ doctorId }) => {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!doctorId) {
      console.log('❌ FloatingAlerts: No doctorId provided');
      return;
    }

    console.log('🔌 FloatingAlerts: Connecting for doctor:', doctorId);
    
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ FloatingAlerts: Socket connected with ID:', newSocket.id);
      newSocket.emit('joinDoctorRoom', doctorId);
      console.log('🏠 FloatingAlerts: Joined room for doctor:', doctorId);
    });

    newSocket.on('newAlert', (data) => {
      console.log('🚨 FloatingAlerts: NEW ALERT RECEIVED:', data);
      
      const alertData = {
        id: Date.now() + Math.random(),
        patientId: data.patient._id,
        patientName: `${data.patient.firstName} ${data.patient.lastName}`,
        type: data.alert.type,
        message: data.alert.message,
        severity: data.alert.severity,
        timestamp: new Date().toLocaleTimeString()
      };
      
      console.log('📝 FloatingAlerts: Adding alert:', alertData);
      setAlerts(prev => {
        const newAlerts = [alertData, ...prev].slice(0, 10);
        console.log('📝 FloatingAlerts: Updated alerts array:', newAlerts);
        return newAlerts;
      });
    });

    // Listen for test broadcast
    newSocket.on('testBroadcast', (data) => {
      console.log('📢 FloatingAlerts: Received test broadcast:', data);
    });

    // Listen for any socket events for debugging
    newSocket.onAny((eventName, ...args) => {
      console.log('📡 FloatingAlerts: Received event:', eventName, args);
    });

    // Test if we're in the right room
    setTimeout(() => {
      console.log('🔍 FloatingAlerts: Testing room connection for doctor_' + doctorId);
    }, 3000);

    return () => {
      console.log('🔌 FloatingAlerts: Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [doctorId]);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <>
      {/* Floating Alert Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-full shadow-lg transition-all ${
            alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          } text-white hover:scale-110`}
        >
          <AlertTriangle className="h-6 w-6" />
          {alerts.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-500 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Alert Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Health Alerts ({alerts.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={clearAlerts}
                className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No alerts yet</p>
                <p className="text-xs mt-2">Doctor ID: {doctorId}</p>
                <button 
                  onClick={() => console.log('Debug - Current alerts:', alerts, 'Socket:', socket?.connected)}
                  className="text-xs bg-blue-100 px-2 py-1 rounded mt-2 mr-2"
                >
                  Debug Log
                </button>
                <button 
                  onClick={() => {
                    const testAlert = {
                      id: Date.now(),
                      patientId: 'test-123',
                      patientName: 'Test Patient',
                      type: 'HIGH_TEMPERATURE',
                      message: 'Manual test alert',
                      severity: 'HIGH',
                      timestamp: new Date().toLocaleTimeString()
                    };
                    setAlerts(prev => [testAlert, ...prev]);
                    console.log('Added manual test alert');
                  }}
                  className="text-xs bg-green-100 px-2 py-1 rounded mt-2"
                >
                  Add Test Alert
                </button>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(alert.severity)}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {alert.patientName}
                        </p>
                        <span className="text-xs text-gray-500">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">ID: {alert.patientId}</p>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">{alert.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};