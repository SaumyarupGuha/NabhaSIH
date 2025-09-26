const axios = require('axios');

const API_BASE_URL = 'https://nabhasih-1.onrender.com/api';

async function testRegistration() {
  console.log('Testing registration endpoint...');
  
  // Test 1: Check if auth routes are accessible
  try {
    const testResponse = await axios.get(`${API_BASE_URL}/auth/test`);
    console.log('✅ Auth test route working:', testResponse.data);
  } catch (error) {
    console.log('❌ Auth test route failed:', error.response?.data || error.message);
  }

  // Test 2: Try patient registration
  const patientData = {
    firstName: 'Test',
    lastName: 'Patient',
    phone: '9876543210',
    password: 'password123',
    role: 'patient',
    village: 'nabha',
    age: 25,
    gender: 'male'
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, patientData);
    console.log('✅ Patient registration successful:', response.data);
  } catch (error) {
    console.log('❌ Patient registration failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
  }

  // Test 3: Try doctor registration
  const doctorData = {
    firstName: 'Test',
    lastName: 'Doctor',
    phone: '9876543211',
    password: 'password123',
    role: 'doctor',
    village: 'nabha',
    license: 'DOC123456',
    specialization: 'General Medicine',
    hospital: 'Test Hospital',
    availableDays: ['Monday', 'Tuesday'],
    consultationFee: 500
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, doctorData);
    console.log('✅ Doctor registration successful:', response.data);
  } catch (error) {
    console.log('❌ Doctor registration failed:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

testRegistration();