const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Prescription = require('../models/Prescription');

// Ensure dotenv is loaded
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('Cloudinary config check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
});

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// Upload to Cloudinary helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    console.log('🔧 Starting Cloudinary upload...');
    console.log('🔑 Using config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
    });
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image', 
        folder: 'prescriptions',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          console.log('✅ Cloudinary success:', result.secure_url);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Extract text from uploaded prescription image
router.post('/extract-text', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log('📁 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    console.log('☁️ Uploading to Cloudinary...');
    console.log('🔧 Environment check:', {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });

    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(req.file.buffer);
      console.log('✅ Cloudinary upload successful:', uploadResult.secure_url);
    } catch (cloudinaryError) {
      console.error('❌ Cloudinary upload failed:', cloudinaryError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image to cloud storage: ' + cloudinaryError.message 
      });
    }

    // OCR API request
    let text = '';
    try {
      console.log('🔍 Starting OCR process...');
      const response = await fetch(`https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(uploadResult.secure_url)}`, {
        method: 'GET',
        headers: { 'apikey': process.env.IMAGE_TO_TEXT_API_KEY }
      });
      
      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status} ${response.statusText}`);
      }
      
      text = await response.text();
      console.log('📝 OCR Response:', text.substring(0, 200) + '...');
    } catch (ocrError) {
      console.error('❌ OCR failed:', ocrError);
      text = 'Unable to extract text from image. Please ensure the image is clear and try again.';
    }

    // Parse medicines
    const medicines = parseMedicinesFromText(text);
    console.log('💊 Parsed medicines:', medicines);

    // Save prescription to DB
    try {
      const prescription = new Prescription({
        patient: req.user.id,
        doctor: req.user.id,
        appointment: new mongoose.Types.ObjectId(),
        medicines: medicines.map(med => ({ name: med.name, quantity: med.quantity || 1 })),
        diagnosis: 'Prescription from uploaded image',
        status: 'active',
        imageUrl: uploadResult.secure_url
      });
      await prescription.save();
      console.log('💾 Prescription saved to DB:', prescription._id);
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      // Continue anyway, return the extracted data
    }

    res.json({ 
      success: true, 
      data: { 
        extractedText: text, 
        medicines, 
        imageUrl: uploadResult.secure_url 
      } 
    });

  } catch (error) {
    console.error('❌ General error in extract-text:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test Cloudinary upload route
router.post('/test-upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log('🧪 Testing Cloudinary upload...');
    console.log('📁 File info:', {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });

    const uploadResult = await uploadToCloudinary(req.file.buffer);
    
    console.log('✅ Upload successful!');
    console.log('🔗 URL:', uploadResult.secure_url);
    console.log('🆔 Public ID:', uploadResult.public_id);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      }
    });

  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed: ' + error.message,
      error: error.toString()
    });
  }
});

function parseMedicinesFromText(text) {
  const keywords = ['paracetamol','crocin','aspirin','ibuprofen','amoxicillin','azithromycin','omeprazole','metformin','atorvastatin','losartan','tablet','capsule','syrup','mg','ml','dolo','combiflam','disprin'];
  const lines = text.toLowerCase().split('\n');
  const found = [];
  const added = new Set();

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length > 2 && keywords.some(k => trimmed.includes(k)) && !added.has(trimmed)) {
      const qtyMatch = trimmed.match(/\d+/);
      const qty = qtyMatch ? parseInt(qtyMatch[0]) : 1;
      found.push({ name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1), quantity: qty, price: '₹50', availability: 'In Stock' });
      added.add(trimmed);
    }
  });

  return found;
}

module.exports = router;