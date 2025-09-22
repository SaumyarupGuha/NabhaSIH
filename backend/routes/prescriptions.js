const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Prescription = require('../models/Prescription');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('Cloudinary config check:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set'
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
    cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image', 
        folder: 'prescriptions',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// Extract text from uploaded prescription image
router.post('/extract-text', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });

    console.log('Uploading to Cloudinary...');
    console.log('Environment check:', {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    });
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    console.log('Cloudinary URL:', uploadResult.secure_url);

    // OCR API request
    const response = await fetch(`https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(uploadResult.secure_url)}`, {
      method: 'GET',
      headers: { 'apikey': process.env.IMAGE_TO_TEXT_API_KEY }
    });
    
    const text = await response.text();
    console.log('OCR Response:', text);

    // Parse medicines
    const medicines = parseMedicinesFromText(text);

    // Save prescription to DB
    const prescription = new Prescription({
      patient: req.user.id,
      doctor: req.user.id,
      appointment: new mongoose.Types.ObjectId(),
      medicines: medicines.map(med => ({ name: med.name, quantity: med.quantity || 1 })),
      diagnosis: 'Prescription from uploaded image',
      status: 'active'
    });
    await prescription.save();

    res.json({ success: true, data: { extractedText: text, medicines, prescriptionId: prescription._id, imageUrl: uploadResult.secure_url } });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
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