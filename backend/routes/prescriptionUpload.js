const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/extract', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    console.log('Processing prescription image...');
    
    // Use Image to Text API with your uploaded image
    let text = '';
    
    if (process.env.IMAGE_TO_TEXT_API_KEY) {
      try {
        const base64Image = req.file.buffer.toString('base64');
        
        // Check image size and format
        console.log('Image size:', req.file.size, 'bytes');
        console.log('Image type:', req.file.mimetype);
        
        // Limit image size to 4MB for API
        if (req.file.size > 4 * 1024 * 1024) {
          throw new Error('Image too large. Please use an image smaller than 4MB.');
        }
        
        // Use the working APILayer method from prescriptions.js
        console.log('Uploading to Cloudinary first...');
        const cloudinary = require('cloudinary').v2;
        
        // Configure Cloudinary
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        
        console.log('Cloudinary URL:', uploadResult.secure_url);
        
        // Use APILayer OCR service
        const response = await fetch(`https://api.apilayer.com/image_to_text/url?url=${encodeURIComponent(uploadResult.secure_url)}`, {
          method: 'GET',
          headers: { 'apikey': process.env.IMAGE_TO_TEXT_API_KEY }
        });
        
        const rawText = await response.text();
        console.log('OCR Response:', rawText);
        
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
        
        // Create fake response format for compatibility
        response.data = [{ text: extractedText }];

        text = response.data.map(item => item.text).join(' ');
        console.log('Extracted from your image:', text);
      } catch (apiError) {
        console.error('API extraction failed:', apiError.message);
        console.error('Full error:', apiError.response?.data || apiError);
        text = 'Could not extract text from image. Please try a clearer prescription image.';
      }
    } else {
      text = 'No API key configured';
    }

    // Extract medicines using comprehensive patterns
    const medicines = [];
    const textLower = text.toLowerCase();
    const words = text.split(/\s+/);
    
    // Comprehensive medicine database with variations
    const medicineDatabase = {
      'paracetamol': ['paracetamol', 'acetaminophen', 'tylenol', 'crocin', 'dolo', 'dolo650'],
      'ibuprofen': ['ibuprofen', 'brufen', 'advil', 'nurofen'],
      'aspirin': ['aspirin', 'asprin', 'disprin', 'ecosprin'],
      'amoxicillin': ['amoxicillin', 'amoxil', 'augmentin'],
      'azithromycin': ['azithromycin', 'zithromax', 'azee'],
      'cetirizine': ['cetirizine', 'zyrtec', 'cetrizet'],
      'omeprazole': ['omeprazole', 'prilosec', 'omez'],
      'metformin': ['metformin', 'glucophage'],
      'ciprofloxacin': ['ciprofloxacin', 'cipro'],
      'diclofenac': ['diclofenac', 'voltaren'],
      'loratadine': ['loratadine', 'claritin'],
      'ranitidine': ['ranitidine', 'zantac'],
      'pantoprazole': ['pantoprazole', 'protonix'],
      'domperidone': ['domperidone', 'motilium'],
      'levocetirizine': ['levocetirizine', 'xyzal']
    };

    // Check for medicine names in text
    for (const [mainName, variations] of Object.entries(medicineDatabase)) {
      for (const variation of variations) {
        if (textLower.includes(variation)) {
          // Try to find quantity near the medicine name
          let quantity = 1; // default
          const medicineIndex = textLower.indexOf(variation);
          const nearbyText = text.substring(Math.max(0, medicineIndex - 100), medicineIndex + 200);
          
          // Enhanced quantity patterns
          const quantityPatterns = [
            /(\d+)\s*(?:tablets?|tabs?|capsules?|caps?|pills?|pieces?|nos?|units?)/i,
            /(?:x|×|\*)\s*(\d+)/i,
            /qty[:\s]*(\d+)/i,
            /quantity[:\s]*(\d+)/i,
            /(\d+)\s*(?:times?|daily|bd|tds|qds)/i,
            /take\s*(\d+)/i,
            /use\s*(\d+)/i,
            /(\d+)\s*(?:morning|evening|night)/i,
            /-\s*(\d+)/i,  // For "Asprin - 2" format
            /\s+(\d+)$/i,  // Number at end
            /^(\d+)\s/
          ];
          
          for (const pattern of quantityPatterns) {
            const match = nearbyText.match(pattern);
            if (match && parseInt(match[1]) > 0 && parseInt(match[1]) <= 100) {
              quantity = parseInt(match[1]);
              break;
            }
          }
          
          // Look for dosage
          let dosage = '';
          const dosageMatch = nearbyText.match(/(\d+(?:\.\d+)?)\s*(mg|ml|gm|mcg|g)/i);
          if (dosageMatch) {
            dosage = dosageMatch[1] + dosageMatch[2];
          }
          
          medicines.push({
            name: mainName.charAt(0).toUpperCase() + mainName.slice(1),
            dosage: dosage || 'Standard dose',
            quantity: Math.max(1, quantity)
          });
          break; // Found this medicine, move to next
        }
      }
    }

    // Also try to extract from raw text patterns - prioritize this method
    const lines = text.split('\n').filter(line => line.trim());
    const directExtractions = [];
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length > 2) {
        // Extract medicine name and quantity from patterns like "Asprin - 2" or "Dolo\n-3"
        const patterns = [
          /^([a-zA-Z]+)\s*-\s*(\d+)$/,  // "Asprin - 2"
          /^([a-zA-Z]+)$/  // Just medicine name, check next line for quantity
        ];
        
        const match = cleanLine.match(patterns[0]);
        if (match) {
          const [, name, qty] = match;
          directExtractions.push({
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            dosage: 'Standard dose',
            quantity: parseInt(qty)
          });
        }
      }
    });
    
    // Handle cases like "Eye drop" on one line and "-2" on next line
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      if (/^[a-zA-Z\s]+$/.test(currentLine) && /^-\d+$/.test(nextLine)) {
        const name = currentLine.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        const qty = parseInt(nextLine.replace('-', ''));
        
        directExtractions.push({
          name: name,
          dosage: 'Standard dose',
          quantity: qty
        });
      }
    }
    
    // Also handle inline patterns like "Cough Syrup -2"
    lines.forEach(line => {
      const match = line.trim().match(/^([a-zA-Z\s]+)\s+-\s*(\d+)$/);
      if (match) {
        const [, name, qty] = match;
        const formattedName = name.trim().split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        
        directExtractions.push({
          name: formattedName,
          dosage: 'Standard dose',
          quantity: parseInt(qty)
        });
      }
    });
    
    // Add direct extractions to medicines array
    medicines.push(...directExtractions);

    // Remove duplicates and merge quantities for same medicine
    const medicineMap = new Map();
    
    medicines.forEach(med => {
      const key = med.name.toLowerCase();
      if (medicineMap.has(key)) {
        // Keep the higher quantity when duplicates found
        const existing = medicineMap.get(key);
        if (med.quantity > existing.quantity) {
          medicineMap.set(key, med);
        }
      } else {
        medicineMap.set(key, med);
      }
    });
    
    const uniqueMedicines = Array.from(medicineMap.values());

    res.json({
      success: true,
      extractedText: text,
      medicines: uniqueMedicines.length > 0 ? uniqueMedicines : [
        { name: 'No readable medicines found', dosage: 'Please upload clearer image', quantity: 0 }
      ]
    });

  } catch (error) {
    console.error('Error extracting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract prescription',
      error: error.message
    });
  }
});

module.exports = router;