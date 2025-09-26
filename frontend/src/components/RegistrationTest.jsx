import React, { useState } from 'react';
import { authAPI } from '../lib/api';

export const RegistrationTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Test 1: Check API connectivity
      const healthResponse = await fetch('https://nabhasih-1.onrender.com/api/health');
      const healthData = await healthResponse.json();
      setResult(prev => prev + '\n✅ Health check: ' + JSON.stringify(healthData));

      // Test 2: Test auth endpoint
      const authTestResponse = await fetch('https://nabhasih-1.onrender.com/api/auth/test');
      const authTestData = await authTestResponse.json();
      setResult(prev => prev + '\n✅ Auth test: ' + JSON.stringify(authTestData));

      // Test 3: Test registration
      const testData = {
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        password: 'password123',
        role: 'patient',
        village: 'nabha',
        age: 25,
        gender: 'male'
      };

      const regResponse = await authAPI.register(testData);
      setResult(prev => prev + '\n✅ Registration: ' + JSON.stringify(regResponse.data));

    } catch (error) {
      setResult(prev => prev + '\n❌ Error: ' + (error.response?.data?.message || error.message));
      console.error('Test error:', error);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Registration API Test</h3>
      <button 
        onClick={testAPI} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Registration API'}
      </button>
      <pre className="mt-4 p-2 bg-gray-100 rounded text-sm whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  );
};