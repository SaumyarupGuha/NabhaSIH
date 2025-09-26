import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useCart } from '../context/CartContext';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';

export const PrescriptionUpload = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [medicines, setMedicines] = useState([]);
  const { addToCart } = useCart();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setExtractedText('');
      setMedicines([]);
    }
  };

  const extractTextFromImage = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');

      const response = await fetch('https://nabhasih-1.onrender.com/api/prescriptions/extract-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setExtractedText(result.data.extractedText);
        setMedicines(result.data.medicines);
      } else {
        setExtractedText(result.message || 'Failed to process image');
        setMedicines([]);
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error extracting text: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAllToCart = () => {
    medicines.forEach((medicine) => {
      for (let i = 0; i < (medicine.quantity || 1); i++) {
        addToCart(medicine);
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload Prescription</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="prescription-upload"
            />
            <label htmlFor="prescription-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">Click to upload prescription image</p>
            </label>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{file.name}</span>
                <Button onClick={extractTextFromImage} disabled={loading} size="sm">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Extract Text
                </Button>
              </div>

              {extractedText && (
                <div className="space-y-3">
                  <h3 className="font-medium">Extracted Text:</h3>
                  <div className={`p-3 rounded-lg text-sm max-h-32 overflow-y-auto ${
                    extractedText.includes('Unable to extract') || extractedText.includes('Please ensure') 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-gray-50'
                  }`}>
                    {extractedText}
                  </div>
                  {extractedText.includes('Unable to extract') && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">Tips for better results:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Ensure good lighting</li>
                        <li>Keep the prescription flat and straight</li>
                        <li>Make sure text is clearly visible</li>
                        <li>Avoid shadows or glare</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {medicines.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Detected Medicines:</h3>
                  <div className="space-y-2">
                    {medicines.map((medicine, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${
                        medicine.name === 'Manual Entry Required' 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-white'
                      }`}>
                        <div>
                          <p className="font-medium text-sm">{medicine.name}</p>
                          <p className="text-xs text-gray-500">
                            {medicine.availability === 'Please add medicines manually' 
                              ? medicine.availability
                              : `${medicine.price} • Qty: ${medicine.quantity || 1}`
                            }
                          </p>
                        </div>
                        {medicine.name !== 'Manual Entry Required' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  {medicines.some(m => m.name !== 'Manual Entry Required') && (
                    <Button onClick={addAllToCart} className="w-full">
                      Add All to Cart ({medicines.filter(m => m.name !== 'Manual Entry Required').length} items)
                    </Button>
                  )}
                  {medicines.some(m => m.name === 'Manual Entry Required') && (
                    <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">
                      <p className="font-medium mb-1">Manual Entry Needed</p>
                      <p>The prescription text wasn't clear enough for automatic detection. Please add medicines manually from the pharmacy page.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
