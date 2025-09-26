const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const OnlinePrescription = require('../models/OnlinePrescription');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Create online prescription request (Patient)
router.post('/', auth, upload.single('photo'), async (req, res) => {
  console.log('🚀 POST /online-prescriptions - Request started');
  console.log('📧 Headers:', req.headers);
  console.log('📦 Body:', req.body);
  console.log('👤 User from auth:', req.user);
  
  try {
    console.log('📝 Creating prescription request');
    console.log('👤 Patient ID:', req.user.id);
    console.log('👨⚕️ Doctor ID:', req.body.doctorId);
    console.log('📋 Title:', req.body.title);
    console.log('📄 Description:', req.body.description);
    
    const { doctorId, title, description } = req.body;
    
    if (!doctorId || !title || !description) {
      console.log('❌ Missing required fields:', { doctorId: !!doctorId, title: !!title, description: !!description });
      return res.status(400).json({ error: 'Doctor, title, and description are required' });
    }
    
    let photoUrl = null;
    if (req.file) {
      console.log('📸 Uploading photo to Cloudinary...');
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'consultations' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        photoUrl = result.secure_url;
        console.log('✅ Photo uploaded:', photoUrl);
      } catch (error) {
        console.error('❌ Cloudinary upload error:', error);
      }
    }
    
    console.log('📝 Creating OnlinePrescription object...');
    const prescriptionData = {
      patientId: req.user.id,
      doctorId,
      title,
      description,
      photoUrl
    };
    console.log('📊 Prescription data:', prescriptionData);
    
    const prescription = new OnlinePrescription(prescriptionData);
    console.log('📝 OnlinePrescription object created');

    console.log('💾 Saving to database...');
    const savedPrescription = await prescription.save();
    console.log('✅ Prescription saved successfully with ID:', savedPrescription._id);
    console.log('📊 Saved prescription:', savedPrescription);
    
    res.json({ success: true, prescription: savedPrescription });
    console.log('✅ Response sent successfully');
  } catch (error) {
    console.error('❌ Error creating prescription:');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    if (error.errors) {
      console.error('❌ Validation errors:', error.errors);
    }
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