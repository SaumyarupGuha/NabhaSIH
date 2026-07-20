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
  
  const patientName = `${patient.firstName} ${patient.lastName}`;
  
  // Check temperature
  if (healthData.temperature > THRESHOLDS.HIGH_TEMPERATURE) {
    anomalies.push({
      type: 'HIGH_TEMPERATURE',
      severity: healthData.temperature > 102 ? 'CRITICAL' : 'HIGH',
      message: `🌡️ ${patientName}: Temperature ${healthData.temperature}°F | HR: ${healthData.heartRate} | O2: ${healthData.oxygenSaturation}% | BP: ${healthData.bloodPressure?.systolic || 'N/A'}/${healthData.bloodPressure?.diastolic || 'N/A'}`,
      value: healthData.temperature,
      threshold: THRESHOLDS.HIGH_TEMPERATURE
    });
  }
  
  // Check oxygen saturation
  if (healthData.oxygenSaturation < THRESHOLDS.LOW_OXYGEN) {
    anomalies.push({
      type: 'LOW_OXYGEN',
      severity: healthData.oxygenSaturation < 85 ? 'CRITICAL' : 'HIGH',
      message: `🫁 ${patientName}: Oxygen ${healthData.oxygenSaturation}% | HR: ${healthData.heartRate} | Temp: ${healthData.temperature}°F | BP: ${healthData.bloodPressure?.systolic || 'N/A'}/${healthData.bloodPressure?.diastolic || 'N/A'}`,
      value: healthData.oxygenSaturation,
      threshold: THRESHOLDS.LOW_OXYGEN
    });
  }
  
  // Check heart rate
  if (healthData.heartRate > THRESHOLDS.HIGH_HEART_RATE) {
    anomalies.push({
      type: 'HIGH_HEART_RATE',
      severity: healthData.heartRate > 140 ? 'CRITICAL' : 'HIGH',
      message: `❤️ ${patientName}: Heart Rate ${healthData.heartRate} bpm | Temp: ${healthData.temperature}°F | O2: ${healthData.oxygenSaturation}% | BP: ${healthData.bloodPressure?.systolic || 'N/A'}/${healthData.bloodPressure?.diastolic || 'N/A'}`,
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
      message: `🩸 ${patientName}: BP ${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic} mmHg | HR: ${healthData.heartRate} | Temp: ${healthData.temperature}°F | O2: ${healthData.oxygenSaturation}%`,
      value: healthData.bloodPressure.systolic,
      threshold: THRESHOLDS.HIGH_BLOOD_PRESSURE_SYSTOLIC
    });
  }
  
  console.log(`🩺 Found ${allDoctors.length} doctors, checking ${anomalies.length} anomalies`);
  
  // Create one alert per anomaly and broadcast to all doctors
  for (const anomaly of anomalies) {
    console.log(`⚠️ Processing anomaly: ${anomaly.type} - ${anomaly.message}`);
    const alert = await createAlert({
      patient: healthData.patient,
      doctor: allDoctors[0]._id, // Use first doctor as primary
      healthData: healthData._id,
      ...anomaly
    });
    alerts.push(alert);
    console.log(`✅ Created alert: ${anomaly.type}`);
  }
  
  // Send real-time notifications to all doctors
  if (alerts.length > 0 && io) {
    console.log(`📡 Broadcasting ${alerts.length} alerts to ${allDoctors.length} doctors`);
    
    alerts.forEach(alert => {
      allDoctors.forEach(doctor => {
        const roomName = `doctor_${doctor._id}`;
        io.to(roomName).emit('newAlert', {
          alert,
          patient: patient,
          healthData
        });
      });
      
      console.log(`🚨 Alert broadcasted: ${alert.type} - ${alert.message}`);
    });
    
    console.log(`✅ All alerts sent to doctors`);
  } else {
    console.log(`⚠️ No alerts to send. Alerts: ${alerts.length}, IO: ${!!io}`);
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
router.post('/', auth, async (req, res) => {
  try {
    const { patientId, heartRate, temperature, oxygenSaturation, bloodPressure, timestamp } = req.body;
    
    console.log(`🩺 Received health data for patient ${patientId}:`, {
      heartRate, temperature, oxygenSaturation, bloodPressure
    });
    
    const healthData = new HealthData({
      patient: patientId,
      heartRate,
      temperature,
      oxygenSaturation,
      bloodPressure,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    
    await healthData.save();
    console.log(`💾 Health data saved with ID: ${healthData._id}`);
    
    // Check for anomalies
    const io = req.app.get('io');
    console.log(`🔌 Socket.io instance available:`, !!io);
    
    const alerts = await checkAnomalies(healthData, io);
    
    console.log(`✅ Processing complete. Alerts created: ${alerts.length}`);
    
    res.json({
      success: true,
      data: healthData,
      alertsCreated: alerts.length,
      debug: {
        patientId,
        healthDataId: healthData._id,
        socketAvailable: !!io
      }
    });
    
  } catch (error) {
    console.error('❌ Health data error:', error);
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