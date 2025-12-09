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

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // OCR API request
    const response = await fetch(`https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(uploadResult.secure_url)}`, {
      method: 'GET',
      headers: { 'apikey': process.env.IMAGE_TO_TEXT_API_KEY }
    });
    
    const rawText = await response.text();


    // Parse JSON response if it's JSON format
    let extractedText = rawText;
    try {
      const jsonResponse = JSON.parse(rawText);
      if (jsonResponse.all_text) {
        extractedText = jsonResponse.all_text;
      }
    } catch (e) {
      // If not JSON, use raw text
      extractedText = rawText;
    }

    // Parse medicines
    const medicines = parseMedicinesFromText(extractedText);

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

    res.json({ success: true, data: { extractedText: extractedText, medicines, prescriptionId: prescription._id, imageUrl: uploadResult.secure_url } });

  } catch (error) {

    res.status(500).json({ success: false, message: error.message });
  }
});

function parseMedicinesFromText(text) {
  const medicineKeywords = [
    'paracetamol', 'crocin', 'aspirin', 'asprin', 'ibuprofen', 'amoxicillin', 'azithromycin', 
    'omeprazole', 'metformin', 'atorvastatin', 'losartan', 'dolo', 'combiflam', 
    'disprin', 'cetirizine', 'pantoprazole', 'ciprofloxacin', 'diclofenac'
  ];
  
  // Clean and normalize text
  const cleanText = text.toLowerCase().trim();
  const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const found = [];
  const added = new Set();
  
  // Process each line to find medicine-quantity pairs
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Pattern 1: Medicine - Quantity (e.g., "asprin - 2")
    const dashPattern = /^([a-zA-Z\s]+)\s*-\s*(\d+)$/;
    const dashMatch = line.match(dashPattern);
    
    if (dashMatch) {
      const medicineName = dashMatch[1].trim();
      const quantity = parseInt(dashMatch[2]);
      
      if (medicineKeywords.some(keyword => medicineName.includes(keyword)) && !added.has(medicineName)) {
        found.push({
          name: medicineName.charAt(0).toUpperCase() + medicineName.slice(1),
          quantity: Math.min(quantity, 10),
          price: '₹50',
          availability: 'In Stock'
        });
        added.add(medicineName);
        continue;
      }
    }
    
    // Pattern 2: Medicine name on one line, quantity on next (e.g., "dolo" followed by "-3")
    if (medicineKeywords.some(keyword => line.includes(keyword)) && !added.has(line)) {
      let quantity = 1;
      
      // Check next line for quantity
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        const qtyMatch = nextLine.match(/^-?(\d+)$/);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1]);
        }
      }
      
      found.push({
        name: line.charAt(0).toUpperCase() + line.slice(1),
        quantity: Math.min(quantity, 10),
        price: '₹50',
        availability: 'In Stock'
      });
      added.add(line);
    }
  }
  
  // If no medicines found, return manual entry message
  if (found.length === 0) {
    return [{
      name: 'Manual Entry Required',
      quantity: 0,
      price: '',
      availability: 'Please add medicines manually'
    }];
  }
  
  return found;
}

module.exports = router;