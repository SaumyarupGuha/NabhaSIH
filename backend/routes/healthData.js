const express = require('express');
const HealthData = require('../models/HealthData');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Anomaly thresholds
const THRESHOLDS = {
  HIGH_TEMPERATURE: 100.4, // °F
  LOW_OXYGEN: 90, // %
  HIGH_HEART_RATE: 120, // bpm
  HIGH_BLOOD_PRESSURE_SYSTOLIC: 140, // mmHg
  HIGH_BLOOD_PRESSURE_DIASTOLIC: 90 // mmHg
};

// Check for anomalies and create alerts
async function checkAnomalies(healthData, io) {
  const alerts = [];
  
  // Find patient and all doctors
  const patient = await User.findById(healthData.patient);
  const allDoctors = await User.find({ role: 'doctor' });
  
  if (!patient || allDoctors.length === 0) return;
  
  // Create alerts for all doctors when anomalies are detected
  const anomalies = [];
  
  // Check temperature
  if (healthData.temperature > THRESHOLDS.HIGH_TEMPERATURE) {
    anomalies.push({
      type: 'HIGH_TEMPERATURE',
      severity: healthData.temperature > 102 ? 'CRITICAL' : 'HIGH',
      message: `High temperature detected: ${healthData.temperature}°F`,
      value: healthData.temperature,
      threshold: THRESHOLDS.HIGH_TEMPERATURE
    });
  }
  
  // Check oxygen saturation
  if (healthData.oxygenSaturation < THRESHOLDS.LOW_OXYGEN) {
    anomalies.push({
      type: 'LOW_OXYGEN',
      severity: healthData.oxygenSaturation < 85 ? 'CRITICAL' : 'HIGH',
      message: `Low oxygen saturation: ${healthData.oxygenSaturation}%`,
      value: healthData.oxygenSaturation,
      threshold: THRESHOLDS.LOW_OXYGEN
    });
  }
  
  // Check heart rate
  if (healthData.heartRate > THRESHOLDS.HIGH_HEART_RATE) {
    anomalies.push({
      type: 'HIGH_HEART_RATE',
      severity: healthData.heartRate > 140 ? 'CRITICAL' : 'HIGH',
      message: `High heart rate detected: ${healthData.heartRate} bpm`,
      value: healthData.heartRate,
      threshold: THRESHOLDS.HIGH_HEART_RATE
    });
  }
  
  // Check blood pressure
  if (healthData.bloodPressure && 
      (healthData.bloodPressure.systolic > THRESHOLDS.HIGH_BLOOD_PRESSURE_SYSTOLIC ||
       healthData.bloodPressure.diastolic > THRESHOLDS.HIGH_BLOOD_PRESSURE_DIASTOLIC)) {
    anomalies.push({
      type: 'HIGH_BLOOD_PRESSURE',
      severity: 'HIGH',
      message: `High blood pressure: ${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic} mmHg`,
      value: healthData.bloodPressure.systolic,
      threshold: THRESHOLDS.HIGH_BLOOD_PRESSURE_SYSTOLIC
    });
  }
  
  console.log(`🩺 Found ${allDoctors.length} doctors, checking ${anomalies.length} anomalies`);
  
  // Create alerts for each doctor for each anomaly
  for (const anomaly of anomalies) {
    console.log(`⚠️ Processing anomaly: ${anomaly.type} - ${anomaly.message}`);
    for (const doctor of allDoctors) {
      const alert = await createAlert({
        patient: healthData.patient,
        doctor: doctor._id,
        healthData: healthData._id,
        ...anomaly
      });
      alerts.push(alert);
      console.log(`✅ Created alert for Dr. ${doctor.firstName} ${doctor.lastName}`);
    }
  }
  
  // Send real-time notifications to all doctors
  if (alerts.length > 0 && io) {
    allDoctors.forEach(doctor => {
      const doctorAlerts = alerts.filter(alert => alert.doctor._id.toString() === doctor._id.toString());
      doctorAlerts.forEach(alert => {
        io.to(`doctor_${doctor._id}`).emit('newAlert', {
          alert,
          patient: patient,
          healthData
        });
      });
    });
  }
  
  return alerts;
}

async function createAlert(alertData) {
  const alert = new Alert(alertData);
  await alert.save();
  return await Alert.findById(alert._id)
    .populate('patient', 'firstName lastName')
    .populate('doctor', 'firstName lastName')
    .populate('healthData');
}

// POST /api/health-data - Receive health data from simulator
router.post('/', async (req, res) => {
  try {
    const { patientId, heartRate, temperature, oxygenSaturation, bloodPressure, timestamp } = req.body;
    
    const healthData = new HealthData({
      patient: patientId,
      heartRate,
      temperature,
      oxygenSaturation,
      bloodPressure,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    
    await healthData.save();
    
    // Check for anomalies
    const io = req.app.get('io');
    const alerts = await checkAnomalies(healthData, io);
    
    res.json({
      success: true,
      data: healthData,
      alertsCreated: alerts.length
    });
    
  } catch (error) {
    console.error('Health data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/health-data/:patientId - Get health data for a patient
router.get('/:patientId', auth, async (req, res) => {
  try {
    const healthData = await HealthData.find({ patient: req.params.patientId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ success: true, data: healthData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/health-data/alerts/doctor - Get alerts for logged-in doctor
router.get('/alerts/doctor', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ doctor: req.user._id, status: 'ACTIVE' })
      .populate('patient', 'firstName lastName')
      .populate('healthData')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/health-data/alerts/:alertId/acknowledge - Acknowledge an alert
router.put('/alerts/:alertId/acknowledge', auth, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.alertId,
      { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
      { new: true }
    ).populate('patient', 'firstName lastName');
    
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;