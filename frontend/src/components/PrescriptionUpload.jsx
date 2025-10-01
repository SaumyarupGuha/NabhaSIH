import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { X, Upload, FileImage, Pill, Plus, Crop } from 'lucide-react';
import { ImageCropper } from './ImageCropper';

export function PrescriptionUpload({ isOpen, onClose, availableMedicines, onAddToCart }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedMedicines, setExtractedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [showCropper, setShowCropper] = useState(false);

  React.useEffect(() => {
    const handlePaste = async (e) => {
      if (!isOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setExtractedMedicines([]);
            setMatchedMedicines([]);
          }
          break;
        }
      }
    };
    
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedMedicines([]);
    }
  };

  const extractPrescription = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);

      const response = await fetch('http://localhost:5000/api/prescription-upload/extract', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setExtractedMedicines(result.medicines);
        

        
        // Match extracted medicines with available medicines
        const matches = [];
        result.medicines.forEach(extracted => {
          // Clean extracted name for better matching
          const cleanExtracted = extracted.name.toLowerCase().replace(/[^a-z]/g, '');
          
          const match = availableMedicines.find(available => {
            const cleanAvailable = available.name.toLowerCase().replace(/[^a-z]/g, '');
            return cleanAvailable.includes(cleanExtracted) || 
                   cleanExtracted.includes(cleanAvailable) ||
                   available.name.toLowerCase().includes(extracted.name.toLowerCase()) ||
                   extracted.name.toLowerCase().includes(available.name.toLowerCase().split(' ')[0]);
          });
          
          if (match) {
            matches.push({
              extracted: extracted,
              available: {
                ...match,
                _id: match._id || `med_${Date.now()}_${Math.random()}`,
                medicineName: match.name,
                unitPrice: match.unitPrice || parseFloat(match.price?.replace('₹', '')) || 50
              },
              confidence: 'Available'
            });
          } else {
            matches.push({
              extracted: extracted,
              available: null,
              confidence: 'Not Found'
            });
          }
        });
        
        setMatchedMedicines(matches);
      } else {
        alert('Failed to extract prescription: ' + result.message);
      }
    } catch (error) {
      console.error('Error extracting prescription:', error);
      alert('Error extracting prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (match) => {
    if (match.available) {
      const quantity = match.extracted.quantity || 1;
      
      // Add medicine multiple times based on extracted quantity
      for (let i = 0; i < quantity; i++) {
        const medicineForCart = {
          _id: match.available._id,
          name: match.available.name,
          medicineName: match.available.name,
          unitPrice: match.available.unitPrice,
          price: `₹${match.available.unitPrice}`,
          availability: 'In Stock',
          quantity: 1
        };
        
        onAddToCart(medicineForCart);
      }
    } else {
      alert(`${match.extracted.name} not available in stock`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Upload Prescription</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Select Prescription Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="prescription-upload"
                />
                <label htmlFor="prescription-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload prescription image</p>
                  <p className="text-sm text-gray-400">Supports JPG, PNG, JPEG • Press Ctrl+V to paste from clipboard</p>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Prescription preview" 
                    className="max-w-full h-48 object-contain mx-auto border rounded"
                  />
                  <div className="flex gap-2 mt-2 justify-center">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowCropper(true)}
                    >
                      <Crop className="h-4 w-4 mr-1" />
                      Crop Image
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedFile && (
                <Button 
                  onClick={extractPrescription}
                  disabled={loading || !availableMedicines}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Extracting & Matching...' : 'Extract & Match Medicines'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Medicine Matching Results */}
          {matchedMedicines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Medicine Matching Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matchedMedicines.map((match, index) => (
                    <div key={index} className={`p-3 border rounded-lg ${
                      match.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{match.extracted.name}</h4>
                            <Badge className={match.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {match.confidence}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {match.extracted.dosage && `${match.extracted.dosage} • `}
                            Quantity: {match.extracted.quantity}
                          </p>
                          {match.available && (
                            <div className="text-sm text-green-700">
                              ✓ Available: {match.available.name} - {match.available.price}
                            </div>
                          )}
                          {!match.available && (
                            <div className="text-sm text-red-700">
                              ✗ Not found in available medicines
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => addToCart(match)}
                          disabled={!match.available}
                          className={match.available ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {match.available ? 'Add to Cart' : 'Not Available'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {showCropper && (
        <ImageCropper
          imageUrl={previewUrl}
          onCrop={(croppedBlob) => {
            const croppedFile = new File([croppedBlob], 'cropped-prescription.png', { type: 'image/png' });
            setSelectedFile(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile));
            setShowCropper(false);
            setExtractedMedicines([]);
            setMatchedMedicines([]);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}