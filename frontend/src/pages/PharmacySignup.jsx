import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MapPin, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function PharmacySignup() {
  const [verifiedPharmacies, setVerifiedPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactPerson: '',
    phone: '',
    workingHours: {
      open: '09:00',
      close: '21:00'
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVerifiedPharmacies();
  }, []);

  const fetchVerifiedPharmacies = async () => {
    try {
      console.log('Fetching pharmacies from:', 'http://localhost:5000/api/pharmacies/verified');
      const response = await fetch('http://localhost:5000/api/pharmacies/verified');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Pharmacies data:', data);
        setVerifiedPharmacies(data.data || []);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        setError(`Failed to load pharmacies: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error: Cannot connect to server');
    }
  };

  const handlePharmacySelect = async (pharmacyId) => {
    setSelectedPharmacy(pharmacyId);
    if (pharmacyId) {
      const pharmacy = verifiedPharmacies.find(p => p._id === pharmacyId);
      setPharmacyDetails(pharmacy);
    } else {
      setPharmacyDetails(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/pharmacies/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pharmacyId: selectedPharmacy,
          role: 'pharmacist'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Pharmacy account created successfully!');
        window.location.href = '/login';
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Registration</h1>
          <p className="text-gray-600">Join our verified pharmacy network</p>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h3 className="font-bold text-yellow-800">Debug Info:</h3>
            <p className="text-sm text-yellow-700">Pharmacies loaded: {verifiedPharmacies.length}</p>
            <p className="text-sm text-yellow-700">Selected pharmacy: {selectedPharmacy || 'None'}</p>
            <p className="text-sm text-yellow-700">Pharmacy details: {pharmacyDetails ? 'Yes' : 'No'}</p>
            {error && <p className="text-sm text-red-700">Error: {error}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Signup Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Verified Pharmacy Signup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pharmacy Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Verified Pharmacy *
                  </label>
                  <select
                    value={selectedPharmacy}
                    onChange={(e) => handlePharmacySelect(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose your pharmacy...</option>
                    {verifiedPharmacies.length === 0 ? (
                      <option disabled>Loading pharmacies...</option>
                    ) : (
                      verifiedPharmacies.map((pharmacy) => (
                        <option key={pharmacy._id} value={pharmacy._id}>
                          {pharmacy.name} - {pharmacy.area}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Auto-filled Pharmacy Details */}
                {pharmacyDetails && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pharmacy Name (Auto-filled)
                      </label>
                      <input
                        type="text"
                        value={pharmacyDetails.name}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pharmacy Address (Auto-filled)
                      </label>
                      <textarea
                        value={`${pharmacyDetails.address}, ${pharmacyDetails.area}, ${pharmacyDetails.city}`}
                        readOnly
                        rows="2"
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number (Auto-filled)
                      </label>
                      <input
                        type="text"
                        value={pharmacyDetails.licenseNumber}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>
                  </>
                )}

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                      <input
                        type="time"
                        value={formData.workingHours.open}
                        onChange={(e) => setFormData({
                          ...formData, 
                          workingHours: {...formData.workingHours, open: e.target.value}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                      <input
                        type="time"
                        value={formData.workingHours.close}
                        onChange={(e) => setFormData({
                          ...formData, 
                          workingHours: {...formData.workingHours, close: e.target.value}
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !selectedPharmacy}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creating Account...' : 'Create Pharmacy Account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pharmacy Details Preview */}
          <div className="space-y-6">
            {pharmacyDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Selected Pharmacy Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{pharmacyDetails.name}</h3>
                    <Badge className="bg-green-100 text-green-800 mt-1">Verified</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{pharmacyDetails.address}</p>
                        <p className="text-sm text-gray-500">{pharmacyDetails.area}, {pharmacyDetails.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">License Number</p>
                        <p className="font-medium">{pharmacyDetails.licenseNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-600">Coordinates</p>
                        <p className="font-medium">
                          {pharmacyDetails.coordinates?.lat}, {pharmacyDetails.coordinates?.lng}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      ✓ This pharmacy is pre-verified and approved for our platform
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a pharmacy to view details</p>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">Real-time order notifications</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">Automated distance-based matching</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">Inventory management tools</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-sm">Revenue analytics dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}