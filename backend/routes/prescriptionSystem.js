const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Medicine = require('../models/Medicine');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

const upload = multer({ storage: multer.memoryStorage() });

// Clean medicine name (remove dosage, units)
const cleanMedicineName = (name) => {
  return name
    .replace(/\d+\s*(mg|ml|g|mcg|iu|units?)\b/gi, '')
    .replace(/\b(tablet|capsule|syrup|injection|drops?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Parse medicines from text (partner's working method)
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

// POST /upload-prescription
router.post('/upload-prescription', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    // Upload to Cloudinary first
    console.log('Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    console.log('Cloudinary URL:', uploadResult.secure_url);

    // OCR API request using APILayer
    const response = await fetch(`https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(uploadResult.secure_url)}`, {
      method: 'GET',
      headers: { 'apikey': process.env.IMAGE_TO_TEXT_API_KEY }
    });
    
    const rawText = await response.text();
    console.log('OCR Response:', rawText);

    // Parse JSON response if it's JSON format
    let text = rawText;
    try {
      const jsonResponse = JSON.parse(rawText);
      if (jsonResponse.all_text) {
        text = jsonResponse.all_text;
      }
    } catch (e) {
      // If not JSON, use raw text
      text = rawText;
    }
    
    console.log('Extracted text:', text);
    
    // Parse medicines using partner's method
    const extractedMedicines = parseMedicinesFromText(text);
    console.log('Extracted medicines:', extractedMedicines);

    // Match with database
    const results = [];
    
    for (const medicineName of extractedMedicines) {
      // Direct match
      const directMatch = await Medicine.findOne({
        $or: [
          { name: new RegExp(medicineName, 'i') },
          { brand: new RegExp(medicineName, 'i') }
        ],
        stock: { $gt: 0 }
      });

      if (directMatch) {
        results.push({
          extracted: medicineName,
          status: 'available',
          medicine: directMatch,
          alternatives: []
        });
      } else {
        // Find alternatives
        const alternatives = await Medicine.find({
          alternatives: new RegExp(medicineName, 'i'),
          stock: { $gt: 0 }
        }).limit(3);

        if (alternatives.length > 0) {
          results.push({
            extracted: medicineName,
            status: 'alternatives',
            medicine: null,
            alternatives: alternatives
          });
        } else {
          results.push({
            extracted: medicineName,
            status: 'unavailable',
            medicine: null,
            alternatives: []
          });
        }
      }
    }

    res.json({
      success: true,
      extractedText: text,
      medicines: results
    });

  } catch (error) {
    console.error('Error processing prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process prescription'
    });
  }
});

// POST /add-to-cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { medicineId, quantity = 1, userId } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Medicine not available or insufficient stock'
      });
    }

    // Add to cart logic (assuming cart is stored in session/database)
    // For now, just return success
    res.json({
      success: true,
      message: 'Added to cart',
      medicine: medicine,
      quantity: quantity
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart'
    });
  }
});

// GET /suggest-alternatives/:medicineName
router.get('/suggest-alternatives/:medicineName', async (req, res) => {
  try {
    const { medicineName } = req.params;
    
    const alternatives = await Medicine.find({
      $or: [
        { alternatives: new RegExp(medicineName, 'i') },
        { name: new RegExp(medicineName, 'i') }
      ],
      stock: { $gt: 0 }
    }).limit(5);

    res.json({
      success: true,
      alternatives: alternatives
    });

  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alternatives'
    });
  }
});

module.exports = router;