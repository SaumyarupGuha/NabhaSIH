const express = require('express');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get prescriptions
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create prescription (doctors only)
router.post('/', [
  auth,
  authorize('doctor'),
  body('appointmentId').notEmpty().withMessage('Appointment ID is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('medicines').isArray({ min: 1 }).withMessage('At least one medicine is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId, diagnosis, medicines, notes } = req.body;

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if prescription already exists
    const existingPrescription = await Prescription.findOne({ appointment: appointmentId });
    if (existingPrescription) {
      return res.status(400).json({ message: 'Prescription already exists for this appointment' });
    }

    const prescription = new Prescription({
      patient: appointment.patient,
      doctor: req.user._id,
      appointment: appointmentId,
      diagnosis,
      medicines,
      notes
    });

    await prescription.save();

    // Update appointment with prescription
    appointment.prescription = prescription._id;
    await appointment.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName phone')
      .populate('appointment', 'date time');

    res.status(201).json({
      message: 'Prescription created successfully',
      prescription: populatedPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescription by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName phone village')
      .populate('doctor', 'firstName lastName specialization hospital')
      .populate('appointment', 'date time symptoms');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Check authorization
    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;