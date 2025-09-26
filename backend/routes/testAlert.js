const express = require('express');
const Alert = require('../models/Alert');
const User = require('../models/User');
const HealthData = require('../models/HealthData');

const router = express.Router();

// GET /api/test-alert/status - Check system status
router.get('/status', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    const doctors = await User.find({ role: 'doctor' });
    const alerts = await Alert.find({ status: 'ACTIVE' });
    
    res.json({
      success: true,
      data: {
        patients: patients.length,
        doctors: doctors.length,
        activeAlerts: alerts.length,
        socketConnected: !!req.app.get('io')
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/test-alert - Create a test alert
router.post('/', async (req, res) => {
  try {
    console.log('🧪 Creating test alert...');
    
    // Find or create a test patient
    let patient = await User.findOne({ role: 'patient' });
    if (!patient) {
      patient = new User({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient@example.com',
        password: 'hashedpassword',
        role: 'patient',
        phoneNumber: '1234567890'
      });
      await patient.save();
      console.log('✅ Created test patient:', patient._id);
    }
    
    // Find all doctors
    const doctors = await User.find({ role: 'doctor' });
    console.log(`👨‍⚕️ Found ${doctors.length} doctors`);
    
    if (doctors.length === 0) {
      return res.json({ 
        success: false, 
        message: 'No doctors found. Please create a doctor account first.' 
      });
    }
    
    // Create test health data
    const healthData = new HealthData({
      patient: patient._id,
      heartRate: 150, // High heart rate to trigger alert
      temperature: 101.5, // High temperature
      oxygenSaturation: 88, // Low oxygen
      timestamp: new Date()
    });
    await healthData.save();
    console.log('✅ Created test health data:', healthData._id);
    
    // Create test alert
    const alert = new Alert({
      patient: patient._id,
      doctor: doctors[0]._id,
      healthData: healthData._id,
      type: 'HIGH_HEART_RATE',
      severity: 'CRITICAL',
      message: `🚨 TEST ALERT: ${patient.firstName} ${patient.lastName} - Heart Rate: 150 bpm, Temp: 101.5°F, O2: 88%`,
      status: 'ACTIVE'
    });
    await alert.save();
    
    // Populate the alert
    const populatedAlert = await Alert.findById(alert._id)
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName')
      .populate('healthData');
    
    console.log('✅ Created test alert:', populatedAlert._id);
    
    // Send to all doctors via Socket.IO
    const io = req.app.get('io');
    if (io) {
      doctors.forEach(doctor => {
        const roomName = `doctor_${doctor._id}`;
        console.log(`📡 Sending test alert to room: ${roomName}`);
        io.to(roomName).emit('newAlert', {
          alert: populatedAlert,
          patient: patient,
          healthData: healthData
        });
      });
      console.log('✅ Test alert sent via Socket.IO');
    } else {
      console.log('❌ Socket.IO not available');
    }
    
    res.json({
      success: true,
      message: 'Test alert created and sent',
      data: {
        alert: populatedAlert,
        patient: patient,
        healthData: healthData,
        doctorsNotified: doctors.length,
        socketAvailable: !!io
      }
    });
    
  } catch (error) {
    console.error('❌ Test alert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;