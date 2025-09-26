import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

const SocketTest = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    addLog(`Attempting to connect to: ${socketUrl}`);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      addLog(`✅ Connected with ID: ${newSocket.id}`);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      addLog('❌ Disconnected');
    });

    newSocket.on('connect_error', (error) => {
      addLog(`❌ Connection error: ${error.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const testDoctorRoom = () => {
    if (socket) {
      const testDoctorId = 'test-doctor-123';
      socket.emit('joinDoctorRoom', testDoctorId);
      addLog(`🏠 Joined doctor room: ${testDoctorId}`);
    }
  };

  const testPatientRoom = () => {
    if (socket) {
      const testPatientId = 'test-patient-456';
      socket.emit('joinPatientRoom', testPatientId);
      addLog(`🏠 Joined patient room: ${testPatientId}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Socket.IO Connection Test
          <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDoctorRoom} disabled={!connected}>
            Test Doctor Room
          </Button>
          <Button onClick={testPatientRoom} disabled={!connected}>
            Test Patient Room
          </Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
          <h4 className="font-semibold mb-2">Connection Logs:</h4>
          {logs.map((log, index) => (
            <div key={index} className="text-sm font-mono">
              {log}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocketTest;