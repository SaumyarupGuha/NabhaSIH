const express = require('express');
const router = express.Router();
const VideoCall = require('../models/VideoCall');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

// Get available patients (for testing)
router.get('/patients', auth, async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('firstName lastName phone village')
      .limit(20);
    
    res.json({
      success: true,
      patients: patients.map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        phone: p.phone,
        village: p.village
      }))
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a video call
router.post('/start', auth, async (req, res) => {
  try {
    const { patientPhone } = req.body;
    
    if (!patientPhone) {
      return res.status(400).json({ message: 'Patient phone number is required' });
    }
    
    const doctorId = req.user._id;
    console.log('Starting call - Doctor ID:', doctorId, 'Patient Phone:', patientPhone);

    // Verify doctor role
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can start calls' });
    }

    // Normalize phone number for search
    const normalizedPhone = patientPhone.replace(/\D/g, ''); // Remove non-digits
    console.log('Searching for patient with phone:', patientPhone, 'normalized:', normalizedPhone);
    
    // Find patient by phone number (try multiple formats)
    let patient = await User.findOne({ 
      phone: { $in: [patientPhone, normalizedPhone] }, 
      role: 'patient' 
    });
    
    // If not found, try searching by the last 10 digits
    if (!patient && normalizedPhone.length >= 10) {
      const last10Digits = normalizedPhone.slice(-10);
      patient = await User.findOne({ 
        phone: { $regex: last10Digits + '$' }, 
        role: 'patient' 
      });
      console.log('Searching by last 10 digits:', last10Digits);
    }
    
    if (!patient) {
      console.log('No patient found. Checking all patients...');
      const allPatients = await User.find({ role: 'patient' }).select('phone firstName lastName');
      console.log('Available patients:', allPatients.map(p => ({ phone: p.phone, name: `${p.firstName} ${p.lastName}` })));
      return res.status(404).json({ message: 'Patient not found with this phone number' });
    }
    
    console.log('Found patient:', patient.firstName, patient.lastName, 'Phone:', patient.phone);

    // Generate unique room ID
    const roomId = crypto.randomUUID();

    // Create call record
    const videoCall = new VideoCall({
      doctorId,
      patientId: patient._id,
      roomId,
      status: 'pending'
    });

    await videoCall.save();
    console.log('Video call created:', videoCall._id);

    // Get socket.io instance
    const io = req.app.get('io');
    
    // Send notification to patient if they're online
    const callData = {
      callId: videoCall._id,
      roomId,
      doctor: {
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization
      }
    };
    
    console.log('Sending call notification to room:', `patient_${patient._id}`);
    console.log('Call data:', callData);
    console.log('Socket.io instance:', !!io);
    console.log('Connected sockets:', io.engine.clientsCount);
    
    // Send to patient room
    const roomName = `patient_${patient._id}`;
    io.to(roomName).emit('incomingCall', callData);
    
    // Also broadcast to all connected sockets for testing
    io.emit('test', { message: 'Test broadcast', patientId: patient._id });
    
    console.log('Call notification sent to room:', roomName);

    res.json({
      success: true,
      callId: videoCall._id,
      roomId,
      patient: {
        name: `${patient.firstName} ${patient.lastName}`,
        phone: patient.phone
      }
    });
  } catch (error) {
    console.error('Error starting video call:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Accept/Reject call
router.post('/respond', auth, async (req, res) => {
  try {
    const { callId, response } = req.body; // response: 'accept' or 'reject'
    const patientId = req.user._id;
    
    console.log('Call response - User:', req.user.role, 'Patient ID:', patientId);
    console.log('Call ID:', callId, 'Response:', response);

    const videoCall = await VideoCall.findById(callId).populate('doctorId');
    if (!videoCall) {
      return res.status(404).json({ message: 'Call not found' });
    }
    
    console.log('Video call patient ID:', videoCall.patientId.toString());

    if (videoCall.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized - not your call' });
    }

    if (response === 'accept') {
      videoCall.status = 'active';
      videoCall.startTime = new Date();
    } else {
      videoCall.status = 'rejected';
    }

    await videoCall.save();

    // Notify doctor
    const io = req.app.get('io');
    io.to(`doctor_${videoCall.doctorId._id}`).emit('callResponse', {
      callId,
      response,
      roomId: videoCall.roomId
    });

    res.json({ success: true, roomId: videoCall.roomId });
  } catch (error) {
    console.error('Error responding to call:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End call
router.post('/end', auth, async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.user._id;

    const videoCall = await VideoCall.findById(callId);
    if (!videoCall) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if user is part of this call
    if (videoCall.doctorId.toString() !== userId && videoCall.patientId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    videoCall.status = 'ended';
    videoCall.endTime = new Date();
    await videoCall.save();

    // Notify other participant
    const io = req.app.get('io');
    const otherUserId = videoCall.doctorId.toString() === userId ? videoCall.patientId : videoCall.doctorId;
    const userType = videoCall.doctorId.toString() === userId ? 'patient' : 'doctor';
    
    io.to(`${userType}_${otherUserId}`).emit('callEnded', { callId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;