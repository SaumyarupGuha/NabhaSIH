# Prescription Upload Feature

## Overview
The prescription upload feature allows users to upload prescription images, extract text using OCR, and automatically add detected medicines to their cart.

## Setup

### 1. API Key Configuration
Add your APILayer image-to-text API key to the backend `.env` file:
```
IMAGE_TO_TEXT_API_KEY=your-actual-api-key-here
```

### 2. Dependencies
The following dependencies are required:
- Backend: `multer`, `node-fetch`
- Frontend: No additional dependencies needed

## How it Works

1. **Upload**: User clicks "Upload Prescription" button in the Pharmacies page
2. **Image Selection**: User selects an image file (JPG, PNG, etc.)
3. **Text Extraction**: Image is sent to APILayer's image-to-text service
4. **Medicine Detection**: Backend parses extracted text for medicine names
5. **Cart Addition**: Detected medicines are automatically added to the cart

## API Endpoints

### POST /api/prescriptions/extract-text
- **Description**: Extract text from prescription image
- **Authentication**: Required (Bearer token)
- **Body**: FormData with 'image' field
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "extractedText": "...",
      "medicines": [
        {
          "name": "Paracetamol 500mg",
          "price": "₹50",
          "availability": "In Stock"
        }
      ]
    }
  }
  ```

## Medicine Detection Logic
The system looks for common medicine keywords in the extracted text:
- Medicine names: paracetamol, crocin, aspirin, ibuprofen, etc.
- Forms: tablet, capsule, syrup
- Units: mg, ml

## Usage
1. Navigate to Pharmacies page
2. Click "Upload Prescription" button
3. Select prescription image
4. Click "Extract Text"
5. Review detected medicines
6. Click "Add All to Cart"

## Error Handling
- File size limit: 5MB
- Supported formats: Image files only
- Authentication required for API access
- Graceful fallback if OCR service is unavailable