const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Test route to manually trigger alerts
router.post('/trigger', async (req, res) => {
  try {
    const io = req.app.get('io');
    
    // Get all doctors
    const doctors = await User.find({ role: 'doctor' });
    const patients = await User.find({ role: 'patient' });
    
    if (doctors.length === 0 || patients.length === 0) {
      return res.json({ success: false, message: 'No doctors or patients found' });
    }
    
    const testPatient = patients[0];
    
    const testAlert = {
      _id: 'test-' + Date.now(),
      type: 'HIGH_TEMPERATURE',
      message: 'Test Alert: High temperature detected: 102.5°F',
      severity: 'CRITICAL',
      createdAt: new Date()
    };
    
    console.log('🧪 Triggering test alert for all doctors');
    
    // Send to all doctors
    doctors.forEach(doctor => {
      const alertData = {
        alert: testAlert,
        patient: testPatient,
        healthData: {
          temperature: 102.5,
          heartRate: 95,
          oxygenSaturation: 97
        }
      };
      
      console.log(`📤 Sending test alert to doctor_${doctor._id}`);
      console.log('📊 Socket rooms info:', io.sockets.adapter.rooms);
      console.log('📊 Alert data being sent:', alertData);
      io.to(`doctor_${doctor._id}`).emit('newAlert', alertData);
      
      // Also try broadcasting to all connected sockets for testing
      io.emit('testBroadcast', { message: 'Test broadcast to all sockets' });
    });
    
    res.json({ 
      success: true, 
      message: `Test alert sent to ${doctors.length} doctors`,
      doctors: doctors.map(d => ({ id: d._id, name: `${d.firstName} ${d.lastName}` }))
    });
    
  } catch (error) {
    console.error('Test alert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;