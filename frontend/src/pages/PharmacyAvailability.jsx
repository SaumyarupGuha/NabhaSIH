import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Clock, MapPin, Truck, Users, ToggleLeft, ToggleRight, Save } from 'lucide-react';

export default function PharmacyAvailability() {
  const [pharmacy, setPharmacy] = useState(null);
  const [availability, setAvailability] = useState({
    isOpen: true,
    workingHours: {
      open: '09:00',
      close: '21:00'
    },
    deliveryCapacity: 10,
    currentOrders: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const fetchPharmacyData = async () => {
    try {
      const pharmacyId = localStorage.getItem('pharmacyId');
      if (!pharmacyId) return;

      const response = await fetch(`http://localhost:5000/api/pharmacies/profile/${pharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setPharmacy(data.data);
        setAvailability({
          isOpen: data.data.isOpen || true,
          workingHours: data.data.workingHours || { open: '09:00', close: '21:00' },
          deliveryCapacity: data.data.deliveryCapacity || 10,
          currentOrders: data.data.currentOrders || 0
        });
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    }
  };

  const updateAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/pharmacies/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: pharmacy._id,
          ...availability
        })
      });

      if (response.ok) {
        alert('Availability updated successfully!');
      } else {
        alert('Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = () => {
    setAvailability(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Availability</h1>
          <p className="text-gray-600">Manage your pharmacy's operating status and capacity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{pharmacy.name}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{pharmacy.address}</span>
                  </div>
                </div>
                <Badge className={availability.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {availability.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {availability.isOpen ? (
                      <ToggleRight className="h-8 w-8 text-green-600 mr-3" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="font-medium">Pharmacy Status</p>
                      <p className="text-sm text-gray-600">
                        {availability.isOpen ? 'Currently accepting orders' : 'Not accepting orders'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={toggleStatus}
                    className={availability.isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {availability.isOpen ? 'Close' : 'Open'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{availability.currentOrders}</p>
                    <p className="text-sm text-gray-600">Active Orders</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{availability.deliveryCapacity}</p>
                    <p className="text-sm text-gray-600">Max Capacity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Working Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Working Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={availability.workingHours.open}
                      onChange={(e) => setAvailability({
                        ...availability,
                        workingHours: { ...availability.workingHours, open: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={availability.workingHours.close}
                      onChange={(e) => setAvailability({
                        ...availability,
                        workingHours: { ...availability.workingHours, close: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Delivery Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={availability.deliveryCapacity}
                  onChange={(e) => setAvailability({
                    ...availability,
                    deliveryCapacity: parseInt(e.target.value) || 1
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of concurrent orders you can handle
                </p>
              </div>

              {/* Capacity Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Current Load</span>
                  <span className="text-sm text-gray-600">
                    {availability.currentOrders}/{availability.deliveryCapacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      (availability.currentOrders / availability.deliveryCapacity) > 0.8
                        ? 'bg-red-500'
                        : (availability.currentOrders / availability.deliveryCapacity) > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((availability.currentOrders / availability.deliveryCapacity) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {availability.currentOrders >= availability.deliveryCapacity
                    ? 'At maximum capacity'
                    : `${availability.deliveryCapacity - availability.currentOrders} slots available`
                  }
                </p>
              </div>

              <Button
                onClick={updateAvailability}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Updates Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Real-time Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="font-medium text-green-800">Order Notifications</p>
                <p className="text-sm text-green-600">Real-time order alerts</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="font-medium text-blue-800">Stock Sync</p>
                <p className="text-sm text-blue-600">Live inventory updates</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="font-medium text-purple-800">Distance Matching</p>
                <p className="text-sm text-purple-600">Automatic order routing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}