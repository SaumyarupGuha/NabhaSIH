const express = require('express');
const multer = require('multer');
const OnlinePrescription = require('../models/OnlinePrescription');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create online prescription request (Patient)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    console.log('📝 Creating prescription request');
    console.log('👤 Patient ID:', req.user.id);
    console.log('👨‍⚕️ Doctor ID:', req.body.doctorId);
    console.log('📋 Title:', req.body.title);
    console.log('📄 Description:', req.body.description);
    console.log('📷 Photo uploaded:', !!req.file);
    
    if (req.file) {
      console.log('📷 Photo details:', {
        size: req.file.size,
        mimetype: req.file.mimetype,
        filename: req.file.originalname
      });
    }
    
    const { doctorId, title, description } = req.body;
    
    if (!doctorId || !title || !description) {
      console.log('❌ Missing required fields:', { doctorId: !!doctorId, title: !!title, description: !!description });
      return res.status(400).json({ error: 'Doctor, title, and description are required' });
    }
    
    const prescription = new OnlinePrescription({
      patientId: req.user.id,
      doctorId,
      consultationId: new require('mongoose').Types.ObjectId(),
      title,
      description,
      photo: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      } : null
    });

    console.log('💾 Saving to database...');
    const savedPrescription = await prescription.save();
    console.log('✅ Prescription saved with ID:', savedPrescription._id);
    
    res.json({ success: true, prescription: savedPrescription });
  } catch (error) {
    console.error('❌ Error creating prescription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get patient's online prescriptions
router.get('/patient', auth, async (req, res) => {
  try {
    console.log('📋 Fetching prescriptions for patient:', req.user.id);
    
    const prescriptions = await OnlinePrescription.find({ patientId: req.user.id })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    console.log('📊 Found prescriptions:', prescriptions.length);
    res.json(prescriptions);
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get doctor's online prescription queue
router.get('/doctor', auth, async (req, res) => {
  try {
    const prescriptions = await OnlinePrescription.find({ doctorId: req.user.id })
      .populate('patientId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reply to prescription request (Doctor)
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { answer } = req.body;
    
    const prescription = await OnlinePrescription.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { 
        answer, 
        hasReply: true
      },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription request not found' });
    }

    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read (Doctor)
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const prescription = await OnlinePrescription.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription request not found' });
    }

    res.json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;