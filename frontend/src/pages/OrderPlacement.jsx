import React, { useState, useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { MapPin, Clock, Truck, Package, AlertCircle, CheckCircle, Navigation as NavIcon } from 'lucide-react';

export default function OrderPlacement() {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('cart'); // cart, confirming, placed
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    fetchMedicines();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Fallback to Nabha coordinates
          setCoordinates({ lat: 30.1644, lng: 76.1436 });
        }
      );
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/medicines');
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item._id === medicine._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === medicine._id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item._id !== medicineId));
    } else {
      setCart(cart.map(item => 
        item._id === medicineId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateDistance = async () => {
    if (!coordinates) {
      showToast('Location not available. Please enable location services.', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders/test-maps');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          const result = data.data[0];
          const distance = result.distance?.toFixed(2) || 'N/A';
          const duration = Math.round(result.durationInTraffic) || Math.round(result.duration) || 'N/A';
          
          showToast(`Distance: ${distance}km, Travel time: ${duration} min`, 'delivery');
        } else {
          showToast('Unable to calculate distance', 'error');
        }
      } else {
        showToast('Distance calculation failed', 'error');
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      showToast('Network error while calculating distance', 'error');
    }
  };

  const findNearbyPharmacies = async () => {
    if (!coordinates || !deliveryAddress) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/find-pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLocation: coordinates,
          deliveryAddress,
          medicines: cart.map(item => ({ medicineId: item._id, quantity: item.quantity }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNearbyPharmacies(data.data || []);
        if (data.data?.length > 0) {
          setSelectedPharmacy(data.data[0]); // Auto-select nearest
          showToast(`Found ${data.data.length} nearby pharmacies`, 'delivery');
        }
      }
    } catch (error) {
      console.error('Error finding pharmacies:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedPharmacy || cart.length === 0) return;

    setLoading(true);
    setOrderStatus('confirming');

    try {
      console.log('🚀 Sending order with coordinates:', coordinates);
      
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            medicineName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          })),
          customerInfo: {
            name: 'Patient', // You can get this from user context
            phone: '1234567890', // You can get this from user context
            address: deliveryAddress
          },
          deliveryAddress,
          orderedBy: 'patient-id', // You can get this from auth context
          coordinates
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Order response data:', data);
        console.log('⏰ Received estimatedDeliveryTime:', data.data?.estimatedDeliveryTime);
        setOrderStatus('placed');
        setCart([]);
        // Extract delivery time from response
        const deliveryTime = data.data.estimatedDeliveryTime || data.estimatedDeliveryTime || '30 min';
        console.log('🚚 Final deliveryTime used:', deliveryTime);
        console.log('🚚 data.data.estimatedDeliveryTime:', data.data.estimatedDeliveryTime);
        console.log('🚚 data.estimatedDeliveryTime:', data.estimatedDeliveryTime);
        showToast(`Order placed! Estimated delivery: ${deliveryTime}`, 'success');
      } else {
        showToast('Order placement failed. Please try again.', 'error');
        setOrderStatus('cart');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Network error. Please try again.', 'error');
      setOrderStatus('cart');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (orderStatus === 'placed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">Your order has been sent to {selectedPharmacy?.name}</p>
          <Button onClick={() => window.location.href = '/orders'} className="bg-blue-600 hover:bg-blue-700">
            Track Your Order
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Medicines</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Medicine Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Medicines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicines.slice(0, 8).map((medicine) => (
                    <div key={medicine._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{medicine.name}</h3>
                        <Badge className="bg-green-100 text-green-800">₹{medicine.price}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{medicine.category}</p>
                      <Button
                        onClick={() => addToCart(medicine)}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distance Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Distance Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={calculateDistance}
                  disabled={!coordinates}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Check Distance & Travel Time
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your complete delivery address..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={calculateDistance}
                      disabled={!coordinates}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Distance
                    </Button>
                    <Button
                      onClick={findNearbyPharmacies}
                      disabled={!deliveryAddress || cart.length === 0 || loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <NavIcon className="h-4 w-4 mr-2" />
                      {loading ? 'Finding Pharmacies...' : 'Find Nearby Pharmacies'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Pharmacies */}
            {nearbyPharmacies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Pharmacies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nearbyPharmacies.map((pharmacy, index) => (
                      <div
                        key={pharmacy._id}
                        onClick={() => setSelectedPharmacy(pharmacy)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPharmacy?._id === pharmacy._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{pharmacy.name}</h3>
                            <p className="text-sm text-gray-600">{pharmacy.address}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-1" />
                                {pharmacy.distance?.toFixed(1)} km
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {pharmacy.estimatedTime} min
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {index === 0 && (
                              <Badge className="bg-green-100 text-green-800 mb-2">Nearest</Badge>
                            )}
                            <Badge className={
                              pharmacy.availability === 'available' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {pharmacy.availability === 'available' ? 'Available' : 'Limited Stock'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart & Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Your Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item._id} className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Confirmation */}
            {selectedPharmacy && cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Pharmacy</span>
                      <span className="font-medium">{selectedPharmacy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance</span>
                      <span>{selectedPharmacy.distance?.toFixed(1)} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Delivery</span>
                      <span>{selectedPharmacy.estimatedTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-3">
                      <span>Total Amount</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <Button
                      onClick={placeOrder}
                      disabled={loading || orderStatus === 'confirming'}
                      className="w-full bg-green-600 hover:bg-green-700 mt-4"
                    >
                      {orderStatus === 'confirming' ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}