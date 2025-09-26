import React from 'react';
import { RegistrationTest } from '../components/RegistrationTest';
import { VideoCallTest } from '../components/VideoCallTest';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Registration</h1>
        <RegistrationTest />
        
        <div className="mt-8">
          <VideoCallTest />
        </div>
        
        <div className="mt-8 p-4 border rounded">
          <h3 className="font-bold mb-2">Current Environment</h3>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'https://nabhasih-1.onrender.com/api'}</p>
          <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
        </div>
        
        <div className="mt-8 p-4 border rounded">
          <h3 className="font-bold mb-2">Common Issues & Solutions</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>400 Bad Request:</strong> Check if all required fields are provided</li>
            <li><strong>Cannot GET /api/auth/register:</strong> This is normal - the endpoint only accepts POST requests</li>
            <li><strong>CORS errors:</strong> Check if the backend is running and accessible</li>
            <li><strong>Network errors:</strong> Check internet connection and backend URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}