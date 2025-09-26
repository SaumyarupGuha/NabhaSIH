import React, { useState } from 'react';
import { videoCallAPI } from '../lib/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export const VideoCallTest = () => {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testVideoCall = async () => {
    if (!phone) return;
    
    setLoading(true);
    setResult('Testing video call API...');
    
    try {
      console.log('Testing video call with phone:', phone);
      const response = await videoCallAPI.startCall(phone);
      setResult('✅ Video call API working: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Video call test error:', error);
      setResult('❌ Video call API failed: ' + (error.response?.data?.message || error.message));
    }
    
    setLoading(false);
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setResult('Testing direct API call...');
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://nabhasih-1.onrender.com/api';
      
      const response = await fetch(`${apiUrl}/video-calls/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientPhone: phone })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult('✅ Direct API call working: ' + JSON.stringify(data, null, 2));
      } else {
        setResult('❌ Direct API call failed: ' + JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setResult('❌ Direct API call error: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="font-bold">Video Call API Test</h3>
      
      <div className="space-y-2">
        <Input
          placeholder="Enter patient phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={testVideoCall} 
            disabled={!phone || loading}
            size="sm"
          >
            Test via API Client
          </Button>
          
          <Button 
            onClick={testDirectAPI} 
            disabled={!phone || loading}
            variant="outline"
            size="sm"
          >
            Test Direct Fetch
          </Button>
        </div>
      </div>
      
      <div className="text-sm">
        <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'https://nabhasih-1.onrender.com/api'}</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      </div>
      
      <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
};