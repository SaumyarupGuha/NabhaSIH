import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { OrderSuccessModal } from './OrderSuccessModal';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';

export const CartModal = () => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    clearCart 
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderData, setSuccessOrderData] = useState(null);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cod'
  });
  const [closestPharmacies, setClosestPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);

  if (!isCartOpen && !showSuccessModal) return null;

  const getCustomerCoordinates = async (address) => {
    console.log('🔍 CartModal geocoding address:', address);
    
    try {
      const url = `http://localhost:5000/api/google-maps/geocode?address=${encodeURIComponent(address + ', Punjab, India')}`;
      console.log('📡 CartModal geocoding URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log('📍 CartModal geocoding response:', data);
      
      if (data.status === 'OK' && data.results.length > 0) {
        const coords = {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng
        };
        console.log('✅ CartModal successfully geocoded to:', coords);
        return coords;
      } else {
        console.error('❌ CartModal geocoding failed:', data.status, data.error_message);
        throw new Error(`Geocoding failed: ${data.status}`);
      }
    } catch (error) {
      console.error('❌ CartModal geocoding error:', error);
      throw error; // Don't fallback, let the calling function handle it
    }
  };

  const findClosestPharmacies = async (address) => {
    if (!address.trim()) return;
    
    setLoadingPharmacies(true);
    try {
      const userCoords = await getCustomerCoordinates(address);
      
      // Get verified pharmacies
      const pharmaciesResponse = await fetch('http://localhost:5000/api/verified-pharmacies');
      const pharmaciesData = await pharmaciesResponse.json();
      
      if (pharmaciesData.success) {
        // Calculate distances to all pharmacies
        const pharmaciesWithDistance = await Promise.all(
          pharmaciesData.data.map(async (pharmacy) => {
            try {
              console.log(`🏥 Calculating distance to ${pharmacy.name}:`, {
                fromCoords: userCoords,
                toCoords: pharmacy.coordinates,
                fromAddress: address,
                toAddress: pharmacy.address
              });
              
              const response = await fetch('http://localhost:5000/api/distance/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fromAddress: address,
                  toAddress: pharmacy.address,
                  fromCoords: userCoords,
                  toCoords: pharmacy.coordinates
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                  console.log(`✅ ${pharmacy.name}: ${data.data.distance.toFixed(2)}km, ${Math.round(data.data.duration)}min`);
                  return {
                    ...pharmacy,
                    distance: data.data.distance,
                    duration: data.data.duration
                  };
                }
              }
            } catch (error) {
              console.error(`Error calculating distance for ${pharmacy.name}:`, error);
            }
            
            return {
              ...pharmacy,
              distance: 999,
              duration: 999
            };
          })
        );
        
        // Sort by distance and get top 2
        const sortedPharmacies = pharmaciesWithDistance
          .filter(p => p.distance < 999)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);
          
        setClosestPharmacies(sortedPharmacies);
      }
    } catch (error) {
      console.error('Error finding closest pharmacies:', error);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Find closest pharmacies when placing order
    await findClosestPharmacies(orderData.address);
    
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          medicineName: item.name || item.medicineName || 'Unknown Medicine',
          quantity: item.quantity || 1,
          unitPrice: parseFloat((item.price || '0').replace('₹', '')),
          totalPrice: parseFloat((item.price || '0').replace('₹', '')) * (item.quantity || 1)
        })),
        customerInfo: {
          name: orderData.name,
          phone: orderData.phone,
          address: orderData.address
        },
        deliveryAddress: orderData.address,
        coordinates: await getCustomerCoordinates(orderData.address).catch(error => {
          console.error('Failed to get coordinates:', error);
          alert('Could not find your location. Please enter a more specific address.');
          throw error;
        }),
        assignedPharmacy: closestPharmacies[0]?.name || 'Punjab Medical Store',
        orderedBy: '68ccf820249ad6de413eab2f'
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();
      console.log('📦 Order response:', result);
      
      if (result.success) {
        const avgDeliveryTime = closestPharmacies.length > 0 
          ? Math.round(closestPharmacies.reduce((sum, p) => sum + p.duration, 0) / closestPharmacies.length)
          : 30;
          
        const orderData = {
          orderNumber: result.data.orderNumber,
          totalAmount: result.data.totalAmount,
          estimatedDeliveryTime: result.data.estimatedDeliveryTime || result.estimatedDeliveryTime || `${avgDeliveryTime} min`,
          deliveryAddress: result.data.deliveryAddress,
          customerInfo: result.data.customerInfo,
          closestPharmacies: closestPharmacies
        };
        console.log('✅ Success modal data:', orderData);
        setSuccessOrderData(orderData);
        setShowSuccessModal(true);
        clearCart();
        setShowCheckout(false);
        // Don't close cart modal yet - let success modal handle it
      } else {
        alert('Error placing order: ' + result.message);
      }
    } catch (error) {
      alert('Error placing order. Please try again.');
      console.error('Order error:', error);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessOrderData(null);
    setIsCartOpen(false); // Close cart modal after success modal closes
  };

  return (
    <>
      <OrderSuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        orderData={successOrderData}
      />
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Medicine Cart ({cartItems.length})
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showCheckout ? (
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={item.name || item.medicineName || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name || item.medicineName || 'Unknown Medicine'}</h3>
                        <p className="text-sm text-gray-600">{item.price || '₹0'} each</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.availability === "In Stock" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-orange-100 text-orange-800"
                        }`}>
                          {item.availability}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.name || item.medicineName, (item.quantity || 1) - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(item.name || item.medicineName, (item.quantity || 1) + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{(parseFloat((item.price || '0').replace('₹', '')) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.name || item.medicineName)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total: ₹{getCartTotal().toFixed(2)}</span>
                      <span className="text-sm text-gray-600">+ Delivery charges may apply</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="flex-1"
                      >
                        Clear Cart
                      </Button>
                      <Button 
                        onClick={() => setShowCheckout(true)}
                        className="flex-1"
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {cartItems.map((item, index) => (
                    <div key={item.name || item.medicineName || index} className="flex justify-between text-sm mb-1">
                      <span>{item.name || item.medicineName || 'Unknown Medicine'} x{item.quantity || 1}</span>
                      <span>₹{(parseFloat((item.price || '0').replace('₹', '')) * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>₹{getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={orderData.name}
                    onChange={(e) => setOrderData({...orderData, name: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={orderData.phone}
                    onChange={(e) => setOrderData({...orderData, phone: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <textarea
                    required
                    value={orderData.address}
                    onChange={(e) => setOrderData({...orderData, address: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows="3"
                    placeholder="Enter complete delivery address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={orderData.paymentMethod}
                    onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="flex-1"
                  >
                    Back to Cart
                  </Button>
                  <Button type="submit" className="flex-1">
                    Place Order - ₹{getCartTotal().toFixed(2)}
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      setSuccessOrderData({
                        orderNumber: 'TEST123',
                        totalAmount: 100,
                        estimatedDeliveryTime: '30 min',
                        deliveryAddress: 'Test Address',
                        customerInfo: { phone: '1234567890' }
                      });
                      setShowSuccessModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Test Popup
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
      )}
    </>
  );
};