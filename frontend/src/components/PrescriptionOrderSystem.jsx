import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { X, Upload, FileImage, Pill, Plus, RefreshCw, ShoppingCart } from 'lucide-react';

export function PrescriptionOrderSystem({ isOpen, onClose, onAddToCart }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [extractedText, setExtractedText] = useState('');

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults([]);
      setExtractedText('');
    }
  };

  const processPrescription = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);

      const response = await fetch('http://localhost:5000/api/prescription/upload-prescription', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setResults(result.medicines);
        setExtractedText(result.extractedText);
      } else {
        alert('Failed to process prescription: ' + result.message);
      }
    } catch (error) {
      console.error('Error processing prescription:', error);
      alert('Error processing prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (medicine, quantity = 1) => {
    try {
      const response = await fetch('http://localhost:5000/api/prescription/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: medicine._id,
          quantity: quantity,
          userId: 'user123' // Replace with actual user ID
        })
      });

      const result = await response.json();
      if (result.success) {
        onAddToCart(medicine);
        alert(`${medicine.name} added to cart!`);
      } else {
        alert('Failed to add to cart: ' + result.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };

  const getAlternatives = async (medicineName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/prescription/suggest-alternatives/${encodeURIComponent(medicineName)}`);
      const result = await response.json();
      
      if (result.success && result.alternatives.length > 0) {
        // Update the specific result with alternatives
        setResults(prev => prev.map(item => 
          item.extracted === medicineName 
            ? { ...item, alternatives: result.alternatives, status: 'alternatives' }
            : item
        ));
      }
    } catch (error) {
      console.error('Error fetching alternatives:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Smart Prescription Upload</h2>
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
                Upload Prescription Image
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
                  <p className="text-sm text-gray-400">Supports JPG, PNG, JPEG</p>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-4">
                  <img 
                    src={previewUrl} 
                    alt="Prescription preview" 
                    className="max-w-full h-48 object-contain mx-auto border rounded"
                  />
                </div>
              )}
              
              {selectedFile && (
                <Button 
                  onClick={processPrescription}
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing Prescription...
                    </>
                  ) : (
                    'Process Prescription'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="h-5 w-5 mr-2" />
                  Prescription Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${
                      result.status === 'available' ? 'border-green-200 bg-green-50' :
                      result.status === 'alternatives' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{result.extracted}</h4>
                            <Badge className={
                              result.status === 'available' ? 'bg-green-100 text-green-800' :
                              result.status === 'alternatives' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {result.status === 'available' ? 'Available' :
                               result.status === 'alternatives' ? 'Alternatives Available' :
                               'Not Available'}
                            </Badge>
                          </div>

                          {/* Available Medicine */}
                          {result.status === 'available' && result.medicine && (
                            <div className="bg-white p-3 rounded border mb-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{result.medicine.name}</p>
                                  <p className="text-sm text-gray-600">Brand: {result.medicine.brand}</p>
                                  <p className="text-sm text-green-600">Stock: {result.medicine.stock} units</p>
                                  <p className="text-sm font-semibold">₹{result.medicine.price}</p>
                                </div>
                                <Button 
                                  onClick={() => addToCart(result.medicine)}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Alternatives */}
                          {result.status === 'alternatives' && result.alternatives.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm text-yellow-700 mb-2">Available alternatives:</p>
                              {result.alternatives.map((alt, altIndex) => (
                                <div key={altIndex} className="bg-white p-3 rounded border">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{alt.name}</p>
                                      <p className="text-sm text-gray-600">Brand: {alt.brand}</p>
                                      <p className="text-sm text-green-600">Stock: {alt.stock} units</p>
                                      <p className="text-sm font-semibold">₹{alt.price}</p>
                                    </div>
                                    <Button 
                                      onClick={() => addToCart(alt)}
                                      className="bg-yellow-600 hover:bg-yellow-700"
                                      size="sm"
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      Add Alternative
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Not Available */}
                          {result.status === 'unavailable' && (
                            <div className="bg-white p-3 rounded border">
                              <p className="text-red-600">This medicine is currently not available</p>
                              <Button 
                                onClick={() => getAlternatives(result.extracted)}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Search Alternatives
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug: Show extracted text */}
          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Text (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                  {extractedText}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}