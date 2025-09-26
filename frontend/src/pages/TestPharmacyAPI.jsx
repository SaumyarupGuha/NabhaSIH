import React, { useState, useEffect } from 'react';

export default function TestPharmacyAPI() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API...');
        const response = await fetch('http://localhost:5000/api/pharmacies/verified');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('API Response:', result);
          setData(result);
        } else {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          setError(`API Error: ${response.status} - ${errorText}`);
        }
      } catch (err) {
        console.error('Network Error:', err);
        setError(`Network Error: ${err.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pharmacy API Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Found {data.data?.length || 0} pharmacies
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Raw API Response:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(data || error, null, 2)}
        </pre>
      </div>
    </div>
  );
}