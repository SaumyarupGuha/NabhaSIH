const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get appointments for current user
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone village')
      .populate('doctor', 'firstName lastName specialization hospital')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book appointment (patients only)
router.post('/', [
  auth,
  authorize('patient'),
  body('doctorId').notEmpty().withMessage('Doctor is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('symptoms').notEmpty().withMessage('Symptoms are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId, date, time, type, symptoms } = req.body;
    console.log('Booking request data:', { doctorId, date, time, type, symptoms });

    // Verify doctor exists and is available on the selected day
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Allow appointments on any day - removed availability check

    // Check if slot is available (exclude completed and cancelled appointments)
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      time,
      type: type || 'video',
      symptoms
    });

    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'firstName lastName specialization hospital consultationFee');

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start consultation
router.patch('/:id/start', auth, authorize('doctor'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName phone village age gender');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'in-progress';
    await appointment.save();

    res.json({ message: 'Consultation started', appointment });
  } catch (error) {
    console.error('Start consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End consultation with prescription
router.patch('/:id/complete', [
  auth,
  authorize('doctor'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('medicines').isArray().withMessage('Medicines must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { diagnosis, medicines, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create prescription
    const Prescription = require('../models/Prescription');
    const prescription = new Prescription({
      patient: appointment.patient,
      doctor: req.user._id,
      appointment: appointment._id,
      diagnosis,
      medicines,
      notes
    });

    await prescription.save();

    // Update appointment
    appointment.status = 'completed';
    appointment.prescription = prescription._id;
    await appointment.save();

    res.json({ 
      message: 'Consultation completed successfully', 
      appointment,
      prescription 
    });
  } catch (error) {
    console.error('Complete consultation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.patch('/:id/status', [
  auth,
  body('status').isIn(['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available doctors with filters
router.get('/doctors', async (req, res) => {
  try {
    const { day, verified } = req.query;
    
    let query = { role: 'doctor' };
    
    // Filter by verification status
    if (verified === 'true') {
      query.isVerified = true;
    } else if (verified === 'false') {
      query.isVerified = false;
    }
    
    let doctors = await User.find(query)
      .select('firstName lastName specialization hospital consultationFee availableDays isVerified');
    
    // Show all doctors regardless of day - removed day filtering

    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor's queue (for doctor dashboard)
router.get('/queue', auth, authorize('doctor'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const appointments = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: today },
      status: { $in: ['scheduled', 'in-progress'] }
    })
    .populate('patient', 'firstName lastName phone village age gender')
    .sort({ date: 1, time: 1 });

    // Group by date
    const queue = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    res.json(queue);
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;