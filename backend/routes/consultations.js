const express = require('express');
const multer = require('multer');
const path = require('path');
const Consultation = require('../models/Consultation');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/consultations/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create consultation (Patient)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { doctorId, description } = req.body;
    
    const consultation = new Consultation({
      patient: req.user.id,
      doctor: doctorId,
      description,
      photoUrl: req.file ? `/uploads/consultations/${req.file.filename}` : null
    });

    await consultation.save();
    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient consultations
router.get('/', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ patient: req.user.id })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    const formattedConsultations = consultations.map(c => ({
      ...c.toObject(),
      doctorName: `${c.doctor.firstName} ${c.doctor.lastName}`
    }));

    res.json(formattedConsultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor consultations
router.get('/doctor', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctor: req.user.id })
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 });

    const formattedConsultations = consultations.map(c => ({
      ...c.toObject(),
      patientName: `${c.patient.firstName} ${c.patient.lastName}`
    }));

    res.json(formattedConsultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reply to consultation (Doctor)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { reply } = req.body;
    
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id },
      { 
        reply, 
        hasReply: true,
        hasNewReply: true
      },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark consultation as read (Doctor)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reply as read (Patient)
router.patch('/:id/reply-read', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      { hasNewReply: false },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ success: true, consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;